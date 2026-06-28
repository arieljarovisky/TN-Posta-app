export interface StoreSettings {
  store_id: number;
  enabled: boolean;
  shipping_option_names?: string[];
  updated_at: string;
}

export interface UpdateStoreSettingsRequest {
  enabled?: boolean;
  shipping_option_names?: string[];
}
