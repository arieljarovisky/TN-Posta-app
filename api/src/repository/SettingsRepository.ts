import path from "path";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

import { StoreSettings } from "@features/settings/interfaces/store-settings.interface";

interface IDatabase {
  store_settings: StoreSettings[];
}

const adapter = new FileSync<IDatabase>(path.resolve("db.json"));
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
      updated_at: new Date().toISOString(),
    };
  }

  isEnabled(storeId: number): boolean {
    return this.getByStoreId(storeId).enabled;
  }

  setEnabled(storeId: number, enabled: boolean): StoreSettings {
    const settings: StoreSettings = {
      store_id: Number(storeId),
      enabled,
      updated_at: new Date().toISOString(),
    };

    const existing = database
      .get("store_settings")
      .find({ store_id: Number(storeId) })
      .value();

    if (existing) {
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
