export type DeliveryZone = "CABA" | "GBA";

export interface ZoneEligibility {
  eligible: boolean;
  zone?: DeliveryZone;
  reason?: string;
}

export interface OrderSummary {
  id: number;
  number: number;
  status: string;
  created_at: string;
  recipient_name: string;
  destination: {
    street: string;
    number: string;
    floor?: string;
    locality?: string;
    city: string;
    province: string;
    zipcode: string;
    phone?: string;
  };
  zone_eligibility: ZoneEligibility;
  has_shipment: boolean;
}

export interface Shipment {
  id: string;
  store_id: number;
  order_id: number;
  order_number: number;
  status: "created" | "label_generated";
  zone: DeliveryZone;
  recipient: {
    name: string;
    phone?: string;
  };
  destination: {
    street: string;
    number: string;
    floor?: string;
    locality?: string;
    city: string;
    province: string;
    zipcode: string;
  };
  notes?: string;
  created_at: string;
  label_generated_at?: string;
}

export interface ApiError {
  message: string;
  description?: string;
}
