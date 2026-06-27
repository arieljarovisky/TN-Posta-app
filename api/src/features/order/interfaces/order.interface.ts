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

export interface TiendanubeOrder {
  id: number;
  number: number;
  status: string;
  created_at: string;
  shipping_address?: TiendanubeShippingAddress;
  fulfillments?: TiendanubeFulfillment[];
}

export interface TiendanubeFulfillment {
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
  zone_eligibility: {
    eligible: boolean;
    zone?: "CABA" | "GBA";
    reason?: string;
  };
  has_shipment: boolean;
}
