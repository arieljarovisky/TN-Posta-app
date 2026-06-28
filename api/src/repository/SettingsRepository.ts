import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

import { StoreSettings } from "@features/settings/interfaces/store-settings.interface";
import { getDatabasePath } from "../config/database";

interface IDatabase {
  store_settings: StoreSettings[];
}

const adapter = new FileSync<IDatabase>(getDatabasePath());
const database = low(adapter);

database.defaults({ store_settings: [] }).write();

class SettingsRepository {
  getByStoreId(storeId: number): StoreSettings {
    const existing = database
      .get("store_settings")
      .find({ store_id: Number(storeId) })
      .value();

    if (existing) {
      return existing;
    }

    return {
      store_id: Number(storeId),
      enabled: false,
      shipping_option_names: [],
      updated_at: new Date().toISOString(),
    };
  }

  isEnabled(storeId: number): boolean {
    return this.getByStoreId(storeId).enabled;
  }

  updateStoreSettings(
    storeId: number,
    data: Pick<StoreSettings, "enabled" | "shipping_option_names">
  ): StoreSettings {
    const existing = this.getByStoreId(storeId);
    const settings: StoreSettings = {
      ...existing,
      store_id: Number(storeId),
      enabled: data.enabled,
      shipping_option_names: data.shipping_option_names ?? existing.shipping_option_names ?? [],
      updated_at: new Date().toISOString(),
    };

    const stored = database
      .get("store_settings")
      .find({ store_id: Number(storeId) })
      .value();

    if (stored) {
      database
        .get("store_settings")
        .find({ store_id: Number(storeId) })
        .assign(settings)
        .write();
    } else {
      database.get("store_settings").push(settings).write();
    }

    return settings;
  }

  setEnabled(storeId: number, enabled: boolean): StoreSettings {
    const existing = this.getByStoreId(storeId);

    return this.updateStoreSettings(storeId, {
      enabled,
      shipping_option_names: existing.shipping_option_names ?? [],
    });
  }

  deleteByStoreId(storeId: number): void {
    const storeSettings =
      database
        .get("store_settings")
        .value()
        ?.filter((settings) => settings.store_id !== Number(storeId)) ?? [];

    database.set("store_settings", storeSettings).write();
  }
}

export default new SettingsRepository();
