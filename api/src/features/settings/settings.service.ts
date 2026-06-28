import { settingsRepository } from "@repository";
import { StoreSettings } from "@features/settings/interfaces/store-settings.interface";

class SettingsService {
  getStoreSettings(storeId: number): StoreSettings {
    return settingsRepository.getByStoreId(storeId);
  }

  updateStoreSettings(
    storeId: number,
    data: { enabled?: boolean; shipping_option_names?: string[] }
  ): StoreSettings {
    const current = settingsRepository.getByStoreId(storeId);

    return settingsRepository.updateStoreSettings(storeId, {
      enabled: data.enabled ?? current.enabled,
      shipping_option_names:
        data.shipping_option_names ?? current.shipping_option_names ?? [],
    });
  }

  isServiceEnabled(storeId: number): boolean {
    return settingsRepository.isEnabled(storeId);
  }
}

export default new SettingsService();
