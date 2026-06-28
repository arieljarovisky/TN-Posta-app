export type TrackingStatus =
  | "pending"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const TRACKING_CODE_PREFIX = "TPA";
export const TRACKING_CODE_PATTERN = /^TPA\d{8}$/i;

export const TRACKING_STATUS_LABELS: Record<TrackingStatus, string> = {
  pending: "Pendiente",
  preparing: "En preparacion",
  shipped: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const isTrackingStatus = (value: unknown): value is TrackingStatus =>
  typeof value === "string" &&
  ["pending", "preparing", "shipped", "delivered", "cancelled"].includes(value);
