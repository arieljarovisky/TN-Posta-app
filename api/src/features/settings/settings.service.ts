import { settingsRepository } from "@repository";
import { StoreSettings } from "@features/settings/interfaces/store-settings.interface";

class SettingsService {
  getStoreSettings(storeId: number): StoreSettings {
    return settingsRepository.getByStoreId(storeId);
  }

  updateStoreSettings(
    storeId: number,
    enabled: boolean
  ): StoreSettings {
    return settingsRepository.setEnabled(storeId, enabled);
  }

  isServiceEnabled(storeId: number): boolean {
    return settingsRepository.isEnabled(storeId);
  }
}

export default new SettingsService();
