/** Ruta publica de consulta de envio (evita /seguimiento y /tracking bloqueados por adblock). */
export const PUBLIC_SHIPPING_PAGE_PATH = "/consulta-envio";

export const LEGACY_SHIPPING_PAGE_PATH = "/seguimiento";

export const isPublicShippingPagePath = (path: string): boolean =>
  path === PUBLIC_SHIPPING_PAGE_PATH ||
  path.startsWith(`${PUBLIC_SHIPPING_PAGE_PATH}/`) ||
  path === LEGACY_SHIPPING_PAGE_PATH ||
  path.startsWith(`${LEGACY_SHIPPING_PAGE_PATH}/`);
