import { getAppPublicBaseUrl } from "@config/oauth-urls";
import { tiendanubeContentApiClient } from "@config/tiendanube-content-api.client";
import { buildTrackingPageApiContent, buildTrackingPageDisabledContent } from "@features/public/embed-widget";
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
  seo_title?: Record<string, string>;
  seo_description?: Record<string, string>;
};

type TiendanubePagesResponse = {
  pages?: {
    results?: TiendanubePage[];
    page?: number;
    perPage?: number;
    per_page?: number;
    lastPage?: number;
    last_page?: number;
    total?: number;
  };
};

const PAGES_PER_REQUEST = 20;

type TiendanubeStore = {
  url?: string;
  main_language?: string;
  languages?: string[] | Record<string, unknown>;
  country?: string;
};

const DISABLED_PAGE_HTML = buildTrackingPageDisabledContent();

const SEO_DESCRIPTION =
  "Consulta el estado de tu envio con tu codigo TPA.";

const pageHandlesMatch = (page: TiendanubePage, handle: string): boolean =>
  Object.values(page.handle ?? {}).some(
    (value) => value?.toLowerCase() === handle.toLowerCase()
  );

const isValidLanguageKey = (key: string): boolean =>
  /^[a-z]{2}(_[A-Z]{2})?$/i.test(key.trim());

const addLanguageKey = (keys: Set<string>, language: unknown): void => {
  if (typeof language !== "string") {
    return;
  }

  const trimmed = language.trim();

  if (isValidLanguageKey(trimmed)) {
    keys.add(trimmed);
  }
};

const collectLanguageKeys = (
  store: TiendanubeStore,
  existingPage?: TiendanubePage
): string[] => {
  const keys = new Set<string>();

  for (const field of [
    existingPage?.name,
    existingPage?.handle,
    existingPage?.content,
    existingPage?.seo_title,
    existingPage?.seo_description,
  ]) {
    Object.keys(field ?? {}).forEach((language) => addLanguageKey(keys, language));
  }

  addLanguageKey(keys, store.main_language);

  if (Array.isArray(store.languages)) {
    store.languages.forEach((language) => addLanguageKey(keys, language));
  } else if (store.languages && typeof store.languages === "object") {
    Object.keys(store.languages).forEach((language) => addLanguageKey(keys, language));
  }

  if (store.country === "AR") {
    keys.add("es");
    keys.add("es_AR");
  }

  if (keys.size === 0) {
    keys.add("es");
  }

  return [...keys];
};

const buildLocalizedPageFields = (
  languageKeys: string[],
  title: string,
  content: string,
  seoHandle: string,
  existingPage?: TiendanubePage
) => {
  const name: Record<string, string> = { ...(existingPage?.name ?? {}) };
  const pageContent: Record<string, string> = { ...(existingPage?.content ?? {}) };
  const handle: Record<string, string> = { ...(existingPage?.handle ?? {}) };
  const seoTitle: Record<string, string> = { ...(existingPage?.seo_title ?? {}) };
  const seoDescription: Record<string, string> = {
    ...(existingPage?.seo_description ?? {}),
  };

  for (const language of languageKeys) {
    name[language] = title;
    pageContent[language] = content;
    handle[language] = seoHandle;
    seoTitle[language] = title;
    seoDescription[language] = SEO_DESCRIPTION;
  }

  return {
    name,
    content: pageContent,
    handle,
    seo_title: seoTitle,
    seo_description: seoDescription,
  };
};

const buildI18nBlock = (
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
      seo_description: SEO_DESCRIPTION,
    };
  }

  return i18n;
};

const buildPageWritePayloads = (
  languageKeys: string[],
  title: string,
  content: string,
  seoHandle: string,
  existingPage?: TiendanubePage,
  mode: "create" | "update" = "update"
): Array<Record<string, unknown>> => {
  const localized = buildLocalizedPageFields(
    languageKeys,
    title,
    content,
    seoHandle,
    existingPage
  );
  const i18n = buildI18nBlock(languageKeys, title, content, seoHandle);

  const createPayloads: Array<Record<string, unknown>> = [
    {
      page: {
        publish: true,
        i18n,
      },
    },
    {
      published: true,
      name: localized.name,
      content: localized.content,
      handle: localized.handle,
      seo_title: localized.seo_title,
      seo_description: localized.seo_description,
    },
    {
      published: true,
      name: title,
      content,
      handle: seoHandle,
      seo_title: title,
      seo_description: SEO_DESCRIPTION,
    },
  ];

  const updatePayloads: Array<Record<string, unknown>> = [
    {
      title,
      content,
    },
    {
      name: title,
      content,
    },
    {
      published: true,
      name: localized.name,
      content: localized.content,
      handle: localized.handle,
      seo_title: localized.seo_title,
      seo_description: localized.seo_description,
    },
    {
      page: {
        publish: true,
        i18n,
      },
    },
  ];

  return mode === "create" ? createPayloads : updatePayloads;
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

const decodeApiErrorText = (value: string): string =>
  value.replace(/\\u([0-9a-fA-F]{4})/g, (_match, hex: string) =>
    String.fromCharCode(parseInt(hex, 16))
  );

const formatApiErrorText = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map((item) => decodeApiErrorText(String(item))).join(" ");
  }

  if (typeof value === "string") {
    return decodeApiErrorText(value);
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

  private async getPageById(
    storeId: number,
    pageId: number
  ): Promise<TiendanubePage | undefined> {
    try {
      return (await tiendanubeContentApiClient.get(
        `${storeId}/pages/${pageId}`
      )) as TiendanubePage;
    } catch {
      return undefined;
    }
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
      if (match?.id) {
        return (await this.getPageById(storeId, match.id)) ?? match;
      }

      if (Array.isArray(response)) {
        break;
      }

      lastPage =
        response.pages?.lastPage ??
        response.pages?.last_page ??
        page;
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

  private async listPageHandles(
    storeId: number
  ): Promise<Array<{ id: number; handles: string[] }>> {
    const entries: Array<{ id: number; handles: string[] }> = [];
    let page = 1;
    let lastPage = 1;

    do {
      const response = (await tiendanubeContentApiClient.get(
        `${storeId}/pages?page=${page}&per_page=${PAGES_PER_REQUEST}`
      )) as TiendanubePagesResponse | TiendanubePage[];

      const batch = Array.isArray(response)
        ? response
        : (response.pages?.results ?? []);

      for (const item of batch) {
        if (!item.id) {
          continue;
        }

        entries.push({
          id: item.id,
          handles: Object.values(item.handle ?? {}).filter(Boolean),
        });
      }

      if (Array.isArray(response)) {
        break;
      }

      lastPage =
        response.pages?.lastPage ??
        response.pages?.last_page ??
        page;
      page += 1;
    } while (page <= lastPage);

    return entries;
  }

  private async writePage(
    storeId: number,
    payloads: Array<Record<string, unknown>>,
    pageId?: number
  ): Promise<TiendanubePage | undefined> {
    let lastError: unknown;

    for (let index = 0; index < payloads.length; index += 1) {
      const payload = payloads[index];

      try {
        if (pageId) {
          await tiendanubeContentApiClient.put(
            `${storeId}/pages/${pageId}`,
            payload
          );

          logInfo("tracking-page-sync", "Pagina actualizada con payload", {
            storeId,
            pageId,
            payloadVariant: index,
          });

          return { id: pageId };
        }

        const created = (await tiendanubeContentApiClient.post(
          `${storeId}/pages`,
          payload
        )) as TiendanubePage;

        logInfo("tracking-page-sync", "Pagina creada con payload", {
          storeId,
          pageId: created.id,
          payloadVariant: index,
        });

        return created;
      } catch (error) {
        lastError = error;

        logError(
          "tracking-page-sync",
          "Intento de pagina rechazado por Tiendanube",
          error,
          {
            storeId,
            pageId,
            payloadVariant: index,
          }
        );
      }
    }

    throw lastError;
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
    const content = options.enabled
      ? pageContent || "<p>Consulta el estado de tu envio con tu codigo TPA.</p>"
      : DISABLED_PAGE_HTML;

    try {
      const store = await this.getStore(storeId);
      let existing: TiendanubePage | undefined;

      if (options.existingPageId) {
        existing = await this.getPageById(storeId, options.existingPageId);
      }

      existing ??= await this.findPageByHandle(storeId, handle);

      const languageKeys = collectLanguageKeys(store, existing);
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
        const updatePayloads = buildPageWritePayloads(
          languageKeys,
          title,
          content,
          handle,
          existing,
          "update"
        );

        logInfo("tracking-page-sync", "Actualizando pagina existente", {
          storeId,
          pageId,
          payloadVariants: updatePayloads.length,
        });

        await this.writePage(storeId, updatePayloads, pageId);
      } else if (options.enabled) {
        const createPayloads = buildPageWritePayloads(
          languageKeys,
          title,
          content,
          handle,
          existing,
          "create"
        );

        logInfo("tracking-page-sync", "Creando pagina nueva", {
          storeId,
          payloadVariants: createPayloads.length,
        });

        const created = await this.writePage(storeId, createPayloads);
        pageId = created?.id;
      } else {
        return {
          ok: true,
          message: "Seguimiento desactivado. No habia pagina que actualizar.",
        };
      }

      if (!pageId) {
        return {
          ok: false,
          message:
            "Tiendanube no devolvio el ID de la pagina. Intenta guardar de nuevo.",
        };
      }

      const storeBaseUrl = normalizeStoreBaseUrl(store);
      const pagePublicUrl = storeBaseUrl ? `${storeBaseUrl}/${handle}/` : undefined;

      settingsRepository.updateTrackingPageMeta(storeId, {
        tracking_page_id: pageId,
        tracking_page_handle: handle,
        tracking_page_public_url: pagePublicUrl,
      });

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
      const baseMessage = `Pagina de seguimiento ${action} en tu tienda${
        pagePublicUrl ? `: ${pagePublicUrl}` : "."
      }`;

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
      const detailedMessage = await this.buildSyncFailureMessage(
        storeId,
        handle,
        apiMessage,
        options.existingPageId
      );

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
          detailedMessage ||
          "No pudimos publicar la pagina en Tiendanube. Verifica la conexion de la tienda e intenta de nuevo.",
      };
    }
  }

  private async buildSyncFailureMessage(
    storeId: number,
    handle: string,
    apiMessage: string,
    existingPageId?: number
  ): Promise<string> {
    try {
      const pages = await this.listPageHandles(storeId);
      const handlesSummary = pages
        .map((page) => `${page.id}:${page.handles.join("|") || "sin-handle"}`)
        .slice(0, 8)
        .join(", ");

      const suffix = handlesSummary
        ? ` Handle buscado: ${handle}. Paginas en tienda: ${handlesSummary}.`
        : ` Handle buscado: ${handle}.`;

      return `${apiMessage}${suffix}${
        existingPageId ? ` ID guardado: ${existingPageId}.` : ""
      }`;
    } catch {
      return apiMessage;
    }
  }
}

export default new TrackingPageSyncService();
