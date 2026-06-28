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

export const TIENDANUBE_ADMIN_URL =
  "https://www.tiendanube.com/admin/v2/apps/35321";

export const OAUTH_INSTALL_URL =
  "https://www.tiendanube.com/apps/35321/authorize?state=install";

/** Abre el flujo OAuth fuera del iframe del admin (los links normales no funcionan ahí). */
export const openOAuthInstallUrl = (): void => {
  const url = OAUTH_INSTALL_URL;

  if (isTiendanubeEmbedded()) {
    try {
      if (window.top) {
        window.top.location.assign(url);
        return;
      }
    } catch {
      // iframe cross-origin: no se puede acceder a window.top
    }

    const popup = window.open(url, "_blank", "noopener,noreferrer");

    if (!popup) {
      window.location.assign(url);
    }

    return;
  }

  window.location.assign(url);
};
