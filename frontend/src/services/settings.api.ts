import axios from "@/app/Axios";
import { ShippingRateRule } from "@/types/shipping";

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

export const fetchStoreSettings = async (): Promise<StoreSettingsResponse> => {
  const { data } = await axios.get<StoreSettingsResponse>("/settings");
  return data;
};

export const updateStoreSettings = async (payload: {
  enabled?: boolean;
  shipping_option_names?: string[];
  carrier_name?: string;
  shipping_rates?: ShippingRateRule[];
}): Promise<StoreSettingsResponse> => {
  const { data } = await axios.patch<StoreSettingsResponse>("/settings", payload);

  return data;
};
