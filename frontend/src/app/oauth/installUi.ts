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
