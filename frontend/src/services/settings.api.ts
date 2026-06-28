import axios from "@/app/Axios";

export interface StoreSettingsResponse {
  enabled: boolean;
  updated_at: string;
}

export const fetchStoreSettings = async (): Promise<StoreSettingsResponse> => {
  const { data } = await axios.get<StoreSettingsResponse>("/settings");
  return data;
};

export const updateStoreSettings = async (
  enabled: boolean
): Promise<StoreSettingsResponse> => {
  const { data } = await axios.patch<StoreSettingsResponse>("/settings", {
    enabled,
  });

  return data;
};
