export interface StoreSettings {
  store_id: number;
  enabled: boolean;
  updated_at: string;
}

export interface UpdateStoreSettingsRequest {
  enabled: boolean;
}
