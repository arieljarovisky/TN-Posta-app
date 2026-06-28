import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

import { StoreSettings } from "@features/settings/interfaces/store-settings.interface";
import { ShippingRateRule } from "@features/shipping/interfaces/shipping.interfaces";
import { getDatabasePath } from "../config/database";

interface IDatabase {
  store_settings: StoreSettings[];
}

const adapter = new FileSync<IDatabase>(getDatabasePath());
const database = low(adapter);

database.defaults({ store_settings: [] }).write();

const DEFAULT_CARRIER_NAME = "TN Posta";

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
      carrier_name: DEFAULT_CARRIER_NAME,
      shipping_rates: [],
      updated_at: new Date().toISOString(),
    };
  }

  isEnabled(storeId: number): boolean {
    return this.getByStoreId(storeId).enabled;
  }

  updateStoreSettings(
    storeId: number,
    data: Pick<
      StoreSettings,
      | "enabled"
      | "shipping_option_names"
      | "carrier_name"
      | "shipping_rates"
      | "zone_localities"
      | "sender"
      | "tracking_page_enabled"
      | "tracking_page_title"
    >
  ): StoreSettings {
    const existing = this.getByStoreId(storeId);
    const settings: StoreSettings = {
      ...existing,
      store_id: Number(storeId),
      enabled: data.enabled,
      shipping_option_names: data.shipping_option_names ?? existing.shipping_option_names ?? [],
      carrier_name: data.carrier_name ?? existing.carrier_name ?? DEFAULT_CARRIER_NAME,
      shipping_rates: data.shipping_rates ?? existing.shipping_rates ?? [],
      zone_localities: data.zone_localities ?? existing.zone_localities,
      sender: data.sender ?? existing.sender,
      tracking_page_enabled:
        data.tracking_page_enabled ?? existing.tracking_page_enabled ?? false,
      tracking_page_title:
        data.tracking_page_title ?? existing.tracking_page_title ?? "Seguimiento de envio",
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

  updateCarrier(
    storeId: number,
    data: { carrier_id: number; carrier_name?: string }
  ): StoreSettings {
    const existing = this.getByStoreId(storeId);
    const settings: StoreSettings = {
      ...existing,
      carrier_id: data.carrier_id,
      carrier_name: data.carrier_name ?? existing.carrier_name,
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
      carrier_name: existing.carrier_name,
      shipping_rates: existing.shipping_rates ?? [],
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

export type { ShippingRateRule };
