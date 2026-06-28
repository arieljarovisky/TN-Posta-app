import {
  buildEmbedFormHtmlSnippet,
  buildEmbedScriptHtmlSnippet,
  PUBLIC_EMBED_SCRIPT_PATH,
} from "@features/public/embed-widget";
import { PUBLIC_SHIPPING_PAGE_PATH } from "./public-pages";

export const getClientId = (): string => process.env.CLIENT_ID ?? "35321";

export const getStoreSlug = (): string | undefined => {
  const slug = process.env.STORE_SLUG?.trim();

  return slug || undefined;
};

/**
 * URL oficial de OAuth. Funciona para instalar y reinstalar.
 * NO usar /admin/apps/.../authorize: si la app ya esta instalada, abre el dashboard sin codigo.
 */
export const getOAuthInstallUrl = (): string => {
  const appId = getClientId();

  return `https://www.tiendanube.com/apps/${appId}/authorize?state=install`;
};

export const getExpectedCallbackUrl = (): string => {
  const base = process.env.APP_PUBLIC_URL?.replace(/\/$/, "");

  if (base) {
    return `${base}/auth/install`;
  }

  return "/auth/install";
};

export const getStoreAdminAppUrl = (): string | undefined => {
  const slug = getStoreSlug();
  const appId = getClientId();

  if (!slug) {
    return undefined;
  }

  return `https://${slug}.mitiendanube.com/admin/v2/apps/${appId}`;
};

export const getStoreAppsUrl = (): string | undefined => {
  const slug = getStoreSlug();

  if (!slug) {
    return undefined;
  }

  return `https://${slug}.mitiendanube.com/admin/v2/apps/`;
};

export const getAppPublicBaseUrl = (req?: {
  protocol?: string;
  get?: (name: string) => string | undefined;
}): string => {
  const configured = process.env.APP_PUBLIC_URL?.replace(/\/$/, "");

  if (configured) {
    return configured;
  }

  if (req?.protocol && req.get?.("host")) {
    return `${req.protocol}://${req.get("host")}`;
  }

  return "";
};

export const getPublicTrackingPageUrl = (req?: {
  protocol?: string;
  get?: (name: string) => string | undefined;
}): string => {
  const base = getAppPublicBaseUrl(req);

  return base ? `${base}${PUBLIC_SHIPPING_PAGE_PATH}` : PUBLIC_SHIPPING_PAGE_PATH;
};

export const getPublicEmbedScriptUrl = (req?: {
  protocol?: string;
  get?: (name: string) => string | undefined;
}): string => {
  const base = getAppPublicBaseUrl(req);

  return base ? `${base}${PUBLIC_EMBED_SCRIPT_PATH}` : PUBLIC_EMBED_SCRIPT_PATH;
};

export const getPublicEmbedHtml = (req?: {
  protocol?: string;
  get?: (name: string) => string | undefined;
}): string => buildEmbedFormHtmlSnippet(getAppPublicBaseUrl(req), PUBLIC_SHIPPING_PAGE_PATH);

export const getPublicEmbedScriptHtml = (req?: {
  protocol?: string;
  get?: (name: string) => string | undefined;
}): string => buildEmbedScriptHtmlSnippet(getAppPublicBaseUrl(req));

export const getStorePublicUrl = (): string | undefined => {
  const slug = getStoreSlug();

  if (!slug) {
    return undefined;
  }

  return `https://${slug}.mitiendanube.com`;
};
