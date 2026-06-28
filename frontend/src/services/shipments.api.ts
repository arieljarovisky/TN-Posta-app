import axios from "@/app/Axios";
import { OrderSummary, Shipment } from "@/types/api";

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

export const downloadShipmentLabel = async (
  shipmentId: string,
  orderNumber: number
): Promise<void> => {
  const { data } = await axios.get<Blob>(`/shipments/${shipmentId}/label`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `etiqueta-pedido-${orderNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
