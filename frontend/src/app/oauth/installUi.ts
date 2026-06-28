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

/** Abrir la app embebida en el admin de la tienda (no es el flujo OAuth). */
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

/** URL para desinstalar la app desde el admin de la tienda. */
export const getStoreAppsUrl = (): string => {
  const slug = getStoreSlug();

  if (slug) {
    return `https://${slug}.mitiendanube.com/admin/v2/apps/`;
  }

  return "https://www.tiendanube.com/login";
};

/**
 * URL oficial de OAuth (instalar / reinstalar).
 * La URL /admin/apps/.../authorize solo abre la app si ya esta instalada.
 */
export const getOAuthInstallUrl = (): string => {
  const appId = getClientId();

  return `https://www.tiendanube.com/apps/${appId}/authorize?state=install`;
};

export const OAUTH_INSTALL_URL = getOAuthInstallUrl();

export const TIENDANUBE_ADMIN_URL = getTiendanubeAdminUrl();

/** Inicia OAuth via backend para usar siempre la URL correcta. */
export const openOAuthInstallUrl = (): void => {
  const reconnectPath = "/auth/reconnect";

  if (isTiendanubeEmbedded()) {
    try {
      if (window.top) {
        window.top.location.assign(reconnectPath);
        return;
      }
    } catch {
      // iframe cross-origin
    }

    const popup = window.open(reconnectPath, "_blank", "noopener,noreferrer");

    if (!popup) {
      window.location.assign(reconnectPath);
    }

    return;
  }

  window.location.assign(reconnectPath);
};
