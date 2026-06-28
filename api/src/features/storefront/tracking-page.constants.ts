export const DEFAULT_TRACKING_PAGE_HANDLE = "seguimiento-de-envios";

export const getTrackingPageHandle = (): string =>
  process.env.TRACKING_PAGE_HANDLE?.trim() || DEFAULT_TRACKING_PAGE_HANDLE;

export const getTrackingStorefrontScriptId = (): number | null => {
  const raw = process.env.TRACKING_STOREFRONT_SCRIPT_ID?.trim();

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};
