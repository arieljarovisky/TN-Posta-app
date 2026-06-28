import axios from "@/app/Axios";
import { ShippingRateRule, ZoneLocalitiesMap } from "@/types/shipping";

export interface SenderConfig {
  business_name: string;
  address?: string;
  city?: string;
  phone?: string;
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
  tracking_page_enabled?: boolean;
  tracking_page_title?: string;
  tracking_page_url?: string;
  tracking_page_embed_script_url?: string;
  tracking_page_embed_html?: string;
  store_public_url?: string | null;
  shipping_sync_message?: string;
  updated_at: string;
}

export const fetchStoreSettings = async (): Promise<StoreSettingsResponse> => {
  const { data } = await axios.get<StoreSettingsResponse>("/settings");
  return data;
};

export const updateStoreSettings = async (payload: {
  enabled?: boolean;
  shipping_option_names?: string[];
  carrier_name?: string;
  shipping_rates?: ShippingRateRule[];
  zone_localities?: ZoneLocalitiesMap;
  sender?: SenderConfig;
  tracking_page_enabled?: boolean;
  tracking_page_title?: string;
}): Promise<StoreSettingsResponse> => {
  const { data } = await axios.patch<StoreSettingsResponse>("/settings", payload);

  return data;
};
