declare global {
  interface Window {
    __TN_POSTA_CONFIG__?: {
      clientId?: string;
      storeSlug?: string;
      storeAdminUrl?: string;
    };
  }
}

const getRuntimeConfig = () => window.__TN_POSTA_CONFIG__ ?? {};

export const getClientId = (): string =>
  getRuntimeConfig().clientId ??
  import.meta.env.VITE_CLIENT_ID ??
  "35321";

export const getStoreSlug = (): string | undefined => {
  const slug = getRuntimeConfig().storeSlug?.trim();

  return slug || undefined;
};

export const isTiendanubeEmbedded = (): boolean => {
  if (window.self !== window.top) {
    return true;
  }

  const referrer = document.referrer;

  return (
    referrer.includes("tiendanube.com") ||
    referrer.includes("mitiendanube.com") ||
    referrer.includes("nuvemshop.com.br")
  );
};

/** URL del admin de la tienda (no usar www.tiendanube.com/admin/... — da 404). */
export const getTiendanubeAdminUrl = (): string => {
  const configured = getRuntimeConfig().storeAdminUrl?.trim();

  if (configured) {
    return configured;
  }

  const slug = getStoreSlug();
  const appId = getClientId();

  if (slug) {
    return `https://${slug}.mitiendanube.com/admin/v2/apps/${appId}`;
  }

  return "https://www.tiendanube.com/login";
};

export const getOAuthInstallUrl = (): string => {
  const appId = getClientId();
  const slug = getStoreSlug();
  const state = "install";

  if (slug) {
    return `https://${slug}.mitiendanube.com/admin/apps/${appId}/authorize?state=${state}`;
  }

  return `https://www.tiendanube.com/apps/${appId}/authorize?state=${state}`;
};

export const OAUTH_INSTALL_URL = getOAuthInstallUrl();

export const TIENDANUBE_ADMIN_URL = getTiendanubeAdminUrl();

/** Abre el flujo OAuth fuera del iframe del admin (los links normales no funcionan ahí). */
export const openOAuthInstallUrl = (): void => {
  const url = getOAuthInstallUrl();

  if (isTiendanubeEmbedded()) {
    try {
      if (window.top) {
        window.top.location.assign(url);
        return;
      }
    } catch {
      // iframe cross-origin
    }

    const popup = window.open(url, "_blank", "noopener,noreferrer");

    if (!popup) {
      window.location.assign(url);
    }

    return;
  }

  window.location.assign(url);
};
