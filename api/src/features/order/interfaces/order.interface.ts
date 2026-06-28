export interface TiendanubeShippingAddress {
  name: string;
  address: string;
  number: string;
  floor?: string;
  locality?: string;
  city: string;
  province: string;
  zipcode: string;
  phone?: string;
  country?: string;
}

export interface TiendanubeFulfillmentOrder {
  id?: string;
  recipient?: {
    name?: string;
    phone?: string;
  };
  destination?: {
    street?: string;
    number?: string;
    floor?: string;
    locality?: string;
    city?: string;
    province?: { name?: string } | string;
    zipcode?: string;
    country?: { name?: string } | string;
  };
  shipping?: {
    type?: string;
    carrier?: {
      carrier_id?: string;
      code?: string;
      name?: string;
      app_id?: string | null;
    };
    option?: {
      name?: string;
      code?: string;
      reference?: string | null;
    };
  };
}

export interface TiendanubeOrder {
  id: number;
  number: number;
  status: string;
  created_at: string;
  shipping?: string;
  shipping_option?: string;
  shipping_option_code?: string;
  shipping_option_reference?: string | null;
  shipping_carrier_name?: string | null;
  shipping_address?: TiendanubeShippingAddress;
  fulfillment_orders?: TiendanubeFulfillmentOrder[];
}

export interface OrderSummary {
  id: number;
  number: number;
  status: string;
  created_at: string;
  recipient_name: string;
  shipping_method?: string;
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
  zone_eligibility: {
    eligible: boolean;
    zone?: "CABA" | "GBA";
    reason?: string;
  };
  has_shipment: boolean;
}
