import { DeliveryZone } from "@utils/zone";

export type ShipmentStatus = "created" | "label_generated";

export interface ShipmentDestination {
  street: string;
  number: string;
  floor?: string;
  locality?: string;
  city: string;
  province: string;
  zipcode: string;
}

export interface ShipmentRecipient {
  name: string;
  phone?: string;
}

export interface Shipment {
  id: string;
  store_id: number;
  order_id: number;
  order_number: number;
  status: ShipmentStatus;
  zone: DeliveryZone;
  recipient: ShipmentRecipient;
  destination: ShipmentDestination;
  notes?: string;
  created_at: string;
  label_generated_at?: string;
}

export interface CreateShipmentRequest {
  order_id: number;
  notes?: string;
}
