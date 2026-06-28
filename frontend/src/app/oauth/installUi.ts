export const isTiendanubeEmbedded = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return false;
  }
};

export const TIENDANUBE_ADMIN_URL =
  "https://www.tiendanube.com/admin/v2/apps/35321";
