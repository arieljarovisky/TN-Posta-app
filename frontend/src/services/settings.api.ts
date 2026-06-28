import axios from "@/app/Axios";

export interface StoreSettingsResponse {
  enabled: boolean;
  connected: boolean;
  shipping_option_names: string[];
  updated_at: string;
}

export const fetchStoreSettings = async (): Promise<StoreSettingsResponse> => {
  const { data } = await axios.get<StoreSettingsResponse>("/settings");
  return data;
};

export const updateStoreSettings = async (payload: {
  enabled?: boolean;
  shipping_option_names?: string[];
}): Promise<StoreSettingsResponse> => {
  const { data } = await axios.patch<StoreSettingsResponse>("/settings", payload);

  return data;
};
