import axios from "@/app/Axios";
import {
  buildTnPostaLabelHtml,
  buildTnPostaLabelsBulkHtml,
  LabelPrintItem,
  openPrintableHtml,
  SenderConfig,
} from "@/utils/tnPostaLabelHtml";
import { OrderSummary, Shipment } from "@/types/api";

export interface AssignTrackingResponse {
  shipment: Shipment;
  trackingCode: string;
  assigned: boolean;
  trackingStatus?: string;
  sender: SenderConfig | null;
}

export const fetchEligibleOrders = async (): Promise<OrderSummary[]> => {
  const { data } = await axios.get<OrderSummary[]>("/orders", {
    params: { eligible_only: true },
  });

  return data;
};

export const fetchAllOrders = async (): Promise<OrderSummary[]> => {
  const { data } = await axios.get<OrderSummary[]>("/orders");
  return data;
};

export const createShipment = async (
  orderId: number,
  notes?: string
): Promise<Shipment> => {
  const { data } = await axios.post<Shipment>("/shipments", {
    order_id: orderId,
    notes,
  });

  return data;
};

export const fetchShipments = async (): Promise<Shipment[]> => {
  const { data } = await axios.get<Shipment[]>("/shipments");
  return data;
};

export const assignShipmentTracking = async (
  shipmentId: string
): Promise<AssignTrackingResponse> => {
  const { data } = await axios.post<AssignTrackingResponse>(
    `/shipments/${shipmentId}/tracking/assign`
  );

  return data;
};

const defaultSender = (): SenderConfig => ({
  business_name: "TN Posta",
});

export const printShipmentLabel = async (shipment: Shipment): Promise<Shipment> => {
  const { shipment: updated, trackingCode, sender } =
    await assignShipmentTracking(shipment.id);

  const html = buildTnPostaLabelHtml(updated, trackingCode, sender ?? defaultSender());
  openPrintableHtml(html);

  return updated;
};

export const printShipmentLabelsBulk = async (
  shipments: Shipment[]
): Promise<Shipment[]> => {
  const items: LabelPrintItem[] = [];
  let sender = defaultSender();
  const updatedShipments: Shipment[] = [];

  for (const shipment of shipments) {
    const result = await assignShipmentTracking(shipment.id);
    sender = result.sender ?? sender;
    items.push({
      shipment: result.shipment,
      trackingCode: result.trackingCode,
    });
    updatedShipments.push(result.shipment);
  }

  const html = buildTnPostaLabelsBulkHtml(items, sender);
  openPrintableHtml(html);

  return updatedShipments;
};
