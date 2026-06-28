import { getAppPublicBaseUrl } from "@config/oauth-urls";
import { tiendanubeApiClient } from "@config";
import { buildEmbedFormHtmlSnippet } from "@features/public/embed-widget";
import { PUBLIC_SHIPPING_PAGE_PATH } from "@config/public-pages";
import {
  DEFAULT_TRACKING_PAGE_HANDLE,
  getTrackingPageHandle,
  getTrackingStorefrontScriptId,
} from "@features/storefront/tracking-page.constants";
import { settingsRepository } from "@repository";
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
  };
};

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
  const fromPage = existingPage?.name ? Object.keys(existingPage.name) : [];

  if (fromPage.length) {
    return fromPage;
  }

  if (store.main_language?.trim()) {
    return [store.main_language.trim()];
  }

  if (store.languages?.length) {
    return store.languages.filter(Boolean);
  }

  if (store.country === "AR") {
    return ["es_AR"];
  }

  return ["es"];
};

const buildI18nPayload = (
  languageKeys: string[],
  title: string,
  content: string,
  seoHandle: string
): Record<string, Record<string, string>> => {
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

  return i18n;
};

const normalizeStoreBaseUrl = (store: TiendanubeStore): string => {
  const raw = store.url?.trim();

  if (!raw) {
    return "";
  }

  return raw.replace(/\/$/, "");
};

class TrackingPageSyncService {
  private async getStore(storeId: number): Promise<TiendanubeStore> {
    return (await tiendanubeApiClient.get(`${storeId}/store`)) as TiendanubeStore;
  }

  private async listPages(storeId: number): Promise<TiendanubePage[]> {
    const response = (await tiendanubeApiClient.get(
      `${storeId}/pages?per_page=200`
    )) as TiendanubePagesResponse | TiendanubePage[];

    if (Array.isArray(response)) {
      return response;
    }

    return response.pages?.results ?? [];
  }

  private async findPageByHandle(
    storeId: number,
    handle: string
  ): Promise<TiendanubePage | undefined> {
    const pages = await this.listPages(storeId);

    return pages.find((page) => pageHandlesMatch(page, handle));
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
        await tiendanubeApiClient.post(`${storeId}/scripts`, {
          script_id: scriptId,
          query_params: "{}",
        });
      } catch (error) {
        const status =
          error instanceof Error && "statusCode" in error
            ? Number((error as { statusCode?: number }).statusCode)
            : undefined;

        if (status !== 409 && status !== 422) {
          throw error;
        }
      }

      return "Script de seguimiento activado en la tienda.";
    }

    try {
      await tiendanubeApiClient.delete(`${storeId}/scripts/${scriptId}`);
    } catch (error) {
      const status =
        error instanceof Error && "statusCode" in error
          ? Number((error as { statusCode?: number }).statusCode)
          : undefined;

      if (status !== 404) {
        throw error;
      }
    }

    return "Script de seguimiento desactivado en la tienda.";
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
    const formHtml = buildEmbedFormHtmlSnippet(appOrigin, PUBLIC_SHIPPING_PAGE_PATH);
    const title = options.title.trim() || "Seguimiento de envio";
    const content = options.enabled ? formHtml : DISABLED_PAGE_HTML;

    try {
      const store = await this.getStore(storeId);
      const existingById = options.existingPageId
        ? ((await tiendanubeApiClient.get(
            `${storeId}/pages/${options.existingPageId}`
          )) as TiendanubePage)
        : undefined;

      const existing =
        existingById ??
        (await this.findPageByHandle(storeId, handle));

      const languageKeys = resolveLanguageKeys(store, existing);

      const i18n = buildI18nPayload(languageKeys, title, content, handle);
      let pageId = existing?.id;
      let scriptMessage: string | undefined;

      if (pageId) {
        await tiendanubeApiClient.put(`${storeId}/pages/${pageId}`, {
          page: {
            publish: true,
            i18n,
          },
        });

        logInfo("tracking-page-sync", "Pagina de seguimiento actualizada", {
          storeId,
          pageId,
          handle,
          enabled: options.enabled,
        });
      } else if (options.enabled) {
        const created = (await tiendanubeApiClient.post(`${storeId}/pages`, {
          page: {
            publish: true,
            i18n,
          },
        })) as TiendanubePage;

        pageId = created.id;

        logInfo("tracking-page-sync", "Pagina de seguimiento creada", {
          storeId,
          pageId,
          handle,
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

      const description =
        error instanceof Error && "description" in error
          ? String((error as { description?: string }).description ?? "")
          : "";

      if (description.toLowerCase().includes("permission") || description.includes("403")) {
        return {
          ok: false,
          message:
            "No pudimos publicar la pagina automaticamente. Reinstala la app con permiso write_content en el Portal de Partners.",
        };
      }

      return {
        ok: false,
        message:
          description ||
          "No pudimos publicar la pagina en Tiendanube. Verifica la conexion de la tienda e intenta de nuevo.",
      };
    }
  }
}

export default new TrackingPageSyncService();
