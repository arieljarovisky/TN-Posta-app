export type ShippingRateZone = "caba" | "gba_near" | "gba_extended" | "gba_all";

export interface ShippingRateRule {
  id: string;
  code: string;
  name: string;
  zone: ShippingRateZone;
  price: number;
  active: boolean;
}

export interface TiendanubeShippingCarrier {
  id: number;
  name: string;
  active: boolean;
  callback_url: string;
  types: string;
}

export interface TiendanubeCarrierOption {
  id: number;
  code: string;
  name: string;
  additional_days: number;
  additional_cost: number;
  allow_free_shipping: boolean;
  active: boolean;
}

export interface TiendanubeRatesCallbackRequest {
  store_id: number;
  currency: string;
  language?: string;
  destination: {
    name?: string | null;
    address?: string | null;
    number?: string | null;
    floor?: string | null;
    locality?: string | null;
    city?: string | null;
    province?: string | null;
    country?: string | null;
    postal_code?: string | null;
    phone?: string | null;
  };
  items?: Array<{
    free_shipping?: boolean;
    price?: number;
  }>;
}

export interface TiendanubeShippingRateResponse {
  name: string;
  code: string;
  price: number;
  price_merchant: number;
  currency: string;
  type: "ship";
  reference: string;
}
