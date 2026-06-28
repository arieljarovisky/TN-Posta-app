import {
  ShippingRateRule,
  ShippingRateZone,
} from "@features/shipping/interfaces/shipping.interfaces";

export type ZoneLocalitiesMap = Partial<Record<ShippingRateZone, string[]>>;

export interface SenderConfig {
  business_name: string;
  address?: string;
  city?: string;
  phone?: string;
}

export interface StoreSettings {
  store_id: number;
  enabled: boolean;
  shipping_option_names?: string[];
  carrier_id?: number;
  carrier_name?: string;
  shipping_rates?: ShippingRateRule[];
  zone_localities?: ZoneLocalitiesMap;
  sender?: SenderConfig;
  updated_at: string;
}

export interface UpdateStoreSettingsRequest {
  enabled?: boolean;
  shipping_option_names?: string[];
  carrier_name?: string;
  shipping_rates?: ShippingRateRule[];
  zone_localities?: ZoneLocalitiesMap;
  sender?: SenderConfig;
}

export interface StoreSettingsResponse {
  enabled: boolean;
  connected: boolean;
  shipping_option_names: string[];
  carrier_id?: number | null;
  carrier_name?: string;
  shipping_rates: ShippingRateRule[];
  zone_localities?: ZoneLocalitiesMap;
  sender?: SenderConfig;
  shipping_sync_message?: string;
  updated_at: string;
}
