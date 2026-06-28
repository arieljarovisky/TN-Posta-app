import { Shipment } from "@features/shipment/interfaces/shipment.interface";
import { isTrackingStatus } from "@features/shipment/interfaces/tracking.interface";
import TrackingService from "@features/shipment/tracking.service";

export type TrackingEvent = {
  key: string;
  label: string;
  at: string | null;
  done: boolean;
};

export type PublicTrackingPayload = {
  trackingCode: string;
  orderNumber: number;
  status: string;
  statusLabel: string;
  destinationCity: string;
  customerName: string;
  events: TrackingEvent[];
};

export const buildTrackingEvents = (shipment: Shipment): TrackingEvent[] => {
  const status = isTrackingStatus(shipment.tracking_status)
    ? shipment.tracking_status
    : "preparing";

  return [
    {
      key: "created",
      label: "Pedido registrado",
      at: shipment.created_at,
      done: true,
    },
    {
      key: "tracking",
      label: "Codigo de seguimiento generado",
      at: shipment.label_generated_at ?? null,
      done: Boolean(shipment.label_generated_at),
    },
    {
      key: "preparing",
      label: "En preparacion",
      at:
        status === "preparing"
          ? shipment.tracking_status_updated_at ?? null
          : null,
      done: ["preparing", "shipped", "delivered"].includes(status),
    },
    {
      key: "shipped",
      label: "En camino",
      at:
        status === "shipped" || status === "delivered"
          ? shipment.tracking_status_updated_at ?? null
          : null,
      done: ["shipped", "delivered"].includes(status),
    },
    {
      key: "delivered",
      label: "Entregado",
      at:
        status === "delivered"
          ? shipment.tracking_status_updated_at ?? null
          : null,
      done: status === "delivered",
    },
  ];
};

export const buildPublicTrackingPayload = (
  shipment: Shipment
): PublicTrackingPayload => {
  const status = isTrackingStatus(shipment.tracking_status)
    ? shipment.tracking_status
    : "preparing";

  return {
    trackingCode: shipment.tracking_code ?? "",
    orderNumber: shipment.order_number,
    status,
    statusLabel: TrackingService.getStatusLabel(status),
    destinationCity: `${shipment.destination.city}, ${shipment.destination.province}`,
    customerName: shipment.recipient.name,
    events: buildTrackingEvents(shipment),
  };
};
