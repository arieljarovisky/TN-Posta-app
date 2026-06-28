import { getAppPublicBaseUrl } from "@config/oauth-urls";
import { tiendanubeContentApiClient } from "@config/tiendanube-content-api.client";
import { buildTrackingPageApiContent } from "@features/public/embed-widget";
import { PUBLIC_SHIPPING_PAGE_PATH } from "@config/public-pages";
import {
  getTrackingPageHandle,
  getTrackingStorefrontScriptId,
} from "@features/storefront/tracking-page.constants";
import { settingsRepository } from "@repository";
import { HttpErrorException } from "@utils";
import { logError, logInfo } from "@utils/logger";

type TiendanubePage = {
  id: number;
  handle?: Record<string, string>;
  name?: Record<string, string>;
  content?: Record<string, string>;
};

type TiendanubePagesResponse = {
  pages?: {
    results?: TiendanubePage[];
    page?: number;
    lastPage?: number;
    total?: number;
  };
};

const PAGES_PER_REQUEST = 20;

type TiendanubeStore = {
  url?: string;
  main_language?: string;
  languages?: string[];
  country?: string;
};

const DISABLED_PAGE_HTML =
  '<p style="text-align:center;font-family:system-ui,sans-serif;color:#6b7280;padding:24px">La consulta de seguimiento no esta disponible en este momento. Contacta a la tienda si necesitas ayuda.</p>';

const pageHandlesMatch = (page: TiendanubePage, handle: string): boolean =>
  Object.values(page.handle ?? {}).some(
    (value) => value?.toLowerCase() === handle.toLowerCase()
  );

const resolveLanguageKeys = (
  store: TiendanubeStore,
  existingPage?: TiendanubePage
): string[] => {
  const keys = new Set<string>();

  for (const field of [
    existingPage?.name,
    existingPage?.handle,
    existingPage?.content,
  ]) {
    Object.keys(field ?? {}).forEach((language) => keys.add(language));
  }

  if (store.main_language?.trim()) {
    keys.add(store.main_language.trim());
  }

  store.languages?.filter(Boolean).forEach((language) => keys.add(language));

  if (keys.size === 0) {
    keys.add(store.country === "AR" ? "es_AR" : "es");
  }

  return [...keys];
};

const buildPagePayload = (
  languageKeys: string[],
  title: string,
  content: string,
  seoHandle: string
) => {
  const i18n: Record<string, Record<string, string>> = {};

  for (const language of languageKeys) {
    i18n[language] = {
      title,
      content,
      seo_handle: seoHandle,
      seo_title: title,
      seo_description: "Consulta el estado de tu envio con tu codigo TPA.",
    };
  }

  return {
    page: {
      publish: true,
      i18n,
    },
  };
};

const normalizeStoreBaseUrl = (store: TiendanubeStore): string => {
  const raw = store.url?.trim();

  if (!raw) {
    return "";
  }

  return raw.replace(/\/$/, "");
};

const extractApiErrorMessage = (error: unknown): string => {
  if (error instanceof HttpErrorException) {
    const description = formatApiErrorText(error.description);
    const message = formatApiErrorText(error.message);

    return [description, message].filter(Boolean).join(" - ");
  }

  if (error instanceof Error && "description" in error) {
    const description = formatApiErrorText(
      (error as { description?: unknown }).description
    );
    if (description) {
      return description;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "";
};

const formatApiErrorText = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(" ");
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .flatMap(([key, entry]) => {
        if (Array.isArray(entry)) {
          return entry.map((item) => `${key}: ${String(item)}`);
        }

        return [`${key}: ${String(entry)}`];
      })
      .join(" ");
  }

  if (value == null) {
    return "";
  }

  return String(value);
};

class TrackingPageSyncService {
  private async getStore(storeId: number): Promise<TiendanubeStore> {
    return (await tiendanubeContentApiClient.get(`${storeId}/store`)) as TiendanubeStore;
  }

  private async findPageByHandle(
    storeId: number,
    handle: string
  ): Promise<TiendanubePage | undefined> {
    let page = 1;
    let lastPage = 1;

    do {
      const response = (await tiendanubeContentApiClient.get(
        `${storeId}/pages?page=${page}&per_page=${PAGES_PER_REQUEST}`
      )) as TiendanubePagesResponse | TiendanubePage[];

      const batch = Array.isArray(response)
        ? response
        : (response.pages?.results ?? []);

      const match = batch.find((item) => pageHandlesMatch(item, handle));
      if (match) {
        return match;
      }

      if (Array.isArray(response)) {
        break;
      }

      lastPage = response.pages?.lastPage ?? page;
      page += 1;
    } while (page <= lastPage);

    return undefined;
  }

  private async ensureStorefrontScript(
    storeId: number,
    enabled: boolean
  ): Promise<string | undefined> {
    const scriptId = getTrackingStorefrontScriptId();

    if (!scriptId) {
      return undefined;
    }

    if (enabled) {
      try {
        await tiendanubeContentApiClient.post(`${storeId}/scripts`, {
          script_id: scriptId,
          query_params: "{}",
        });
      } catch (error) {
        const status =
          error instanceof HttpErrorException ? Number(error.statusCode) : undefined;

        if (status !== 409 && status !== 422) {
          throw error;
        }
      }

      return "Script de seguimiento activado en la tienda.";
    }

    try {
      await tiendanubeContentApiClient.delete(`${storeId}/scripts/${scriptId}`);
    } catch (error) {
      const status =
        error instanceof HttpErrorException ? Number(error.statusCode) : undefined;

      if (status !== 404) {
        throw error;
      }
    }

    return "Script de seguimiento desactivado en la tienda.";
  }

  private async updatePage(
    storeId: number,
    pageId: number,
    languageKeys: string[],
    title: string,
    content: string,
    seoHandle: string
  ): Promise<void> {
    await tiendanubeContentApiClient.put(
      `${storeId}/pages/${pageId}`,
      buildPagePayload(languageKeys, title, content, seoHandle)
    );
  }

  private async createPage(
    storeId: number,
    languageKeys: string[],
    title: string,
    content: string,
    seoHandle: string
  ): Promise<TiendanubePage> {
    return (await tiendanubeContentApiClient.post(
      `${storeId}/pages`,
      buildPagePayload(languageKeys, title, content, seoHandle)
    )) as TiendanubePage;
  }

  async syncTrackingPage(
    storeId: number,
    options: {
      enabled: boolean;
      title: string;
      existingPageId?: number;
    }
  ): Promise<{
    ok: boolean;
    message: string;
    pageId?: number;
    pageHandle?: string;
    pagePublicUrl?: string;
  }> {
    const handle = getTrackingPageHandle();
    const appOrigin = getAppPublicBaseUrl();
    const pageContent = buildTrackingPageApiContent(appOrigin, PUBLIC_SHIPPING_PAGE_PATH);
    const title = options.title.trim() || "Seguimiento de envio";
    const content = options.enabled ? pageContent : DISABLED_PAGE_HTML;

    try {
      const store = await this.getStore(storeId);
      let existing: TiendanubePage | undefined;

      if (options.existingPageId) {
        try {
          existing = (await tiendanubeContentApiClient.get(
            `${storeId}/pages/${options.existingPageId}`
          )) as TiendanubePage;
        } catch {
          existing = undefined;
        }
      }

      existing ??= await this.findPageByHandle(storeId, handle);

      const languageKeys = resolveLanguageKeys(store, existing);
      let pageId = existing?.id;
      let scriptMessage: string | undefined;

      logInfo("tracking-page-sync", "Preparando sincronizacion de pagina", {
        storeId,
        pageId,
        handle,
        languageKeys,
        titleLength: title.length,
        contentLength: content.length,
      });

      if (pageId) {
        await this.updatePage(storeId, pageId, languageKeys, title, content, handle);

        logInfo("tracking-page-sync", "Pagina de seguimiento actualizada", {
          storeId,
          pageId,
          handle,
          enabled: options.enabled,
          languageKeys,
        });
      } else if (options.enabled) {
        const created = await this.createPage(
          storeId,
          languageKeys,
          title,
          content,
          handle
        );

        pageId = created.id;

        logInfo("tracking-page-sync", "Pagina de seguimiento creada", {
          storeId,
          pageId,
          handle,
          languageKeys,
        });
      } else {
        return {
          ok: true,
          message: "Seguimiento desactivado. No habia pagina que actualizar.",
        };
      }

      const storeBaseUrl = normalizeStoreBaseUrl(store);
      const pagePublicUrl = storeBaseUrl ? `${storeBaseUrl}/${handle}/` : undefined;

      if (pageId) {
        settingsRepository.updateTrackingPageMeta(storeId, {
          tracking_page_id: pageId,
          tracking_page_handle: handle,
          tracking_page_public_url: pagePublicUrl,
        });
      }

      try {
        scriptMessage = await this.ensureStorefrontScript(storeId, options.enabled);
      } catch (scriptError) {
        logError(
          "tracking-page-sync",
          "No se pudo sincronizar el script de storefront",
          scriptError,
          { storeId }
        );
      }

      const action = options.enabled ? "activada" : "desactivada";
      const baseMessage = pageId
        ? `Pagina de seguimiento ${action} en tu tienda${pagePublicUrl ? `: ${pagePublicUrl}` : "."}`
        : "Seguimiento desactivado.";

      return {
        ok: true,
        message: scriptMessage ? `${baseMessage} ${scriptMessage}` : baseMessage,
        pageId,
        pageHandle: handle,
        pagePublicUrl,
      };
    } catch (error) {
      logError("tracking-page-sync", "Fallo la sincronizacion de pagina", error, {
        storeId,
        handle,
      });

      const apiMessage = extractApiErrorMessage(error);
      const normalized = apiMessage.toLowerCase();

      if (normalized.includes("permission") || normalized.includes("403")) {
        return {
          ok: false,
          message:
            "No pudimos publicar la pagina automaticamente. Reinstala la app con permiso write_content en el Portal de Partners.",
        };
      }

      if (normalized.includes("not found") && normalized.includes("page")) {
        return {
          ok: false,
          message:
            "No encontramos la pagina en Tiendanube. Guarda de nuevo para crearla automaticamente.",
        };
      }

      return {
        ok: false,
        message:
          apiMessage ||
          "No pudimos publicar la pagina en Tiendanube. Verifica la conexion de la tienda e intenta de nuevo.",
      };
    }
  }
}

export default new TrackingPageSyncService();
