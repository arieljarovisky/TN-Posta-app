import {
  ShippingRateRule,
} from "@features/shipping/interfaces/shipping.interfaces";

export interface StoreSettings {
  store_id: number;
  enabled: boolean;
  shipping_option_names?: string[];
  carrier_id?: number;
  carrier_name?: string;
  shipping_rates?: ShippingRateRule[];
  updated_at: string;
}

export interface UpdateStoreSettingsRequest {
  enabled?: boolean;
  shipping_option_names?: string[];
  carrier_name?: string;
  shipping_rates?: ShippingRateRule[];
}

export interface StoreSettingsResponse {
  enabled: boolean;
  connected: boolean;
  shipping_option_names: string[];
  carrier_id?: number | null;
  carrier_name?: string;
  shipping_rates: ShippingRateRule[];
  shipping_sync_message?: string;
  updated_at: string;
}
