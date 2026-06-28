import { useCallback, useEffect, useState } from "react";

import {
  fetchStoreSettings,
  updateStoreSettings,
} from "@/services/settings.api";
import { ShippingRateRule, ZoneLocalitiesMap } from "@/types/shipping";

export const useStoreSettings = () => {
  const [enabled, setEnabled] = useState(false);
  const [connected, setConnected] = useState(true);
  const [carrierName, setCarrierName] = useState("TN Posta");
  const [carrierId, setCarrierId] = useState<number | null>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRateRule[]>([]);
  const [zoneLocalities, setZoneLocalities] = useState<ZoneLocalitiesMap>({});
  const [shippingOptionNames, setShippingOptionNames] = useState<string[]>([]);
  const [shippingSyncMessage, setShippingSyncMessage] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await fetchStoreSettings();
      setEnabled(data.enabled);
      setConnected(data.connected);
      setCarrierName(data.carrier_name ?? "TN Posta");
      setCarrierId(data.carrier_id ?? null);
      setShippingRates(data.shipping_rates ?? []);
      setZoneLocalities(data.zone_localities ?? {});
      setShippingOptionNames(data.shipping_option_names ?? []);
      setShippingSyncMessage(data.shipping_sync_message ?? null);
    } catch {
      setLoadError("No se pudo cargar la configuracion del servicio.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const toggleEnabled = async (nextEnabled: boolean) => {
    setSaving(true);

    try {
      const data = await updateStoreSettings({
        enabled: nextEnabled,
        carrier_name: carrierName,
        shipping_rates: shippingRates,
      });
      setEnabled(data.enabled);
      setConnected(data.connected);
      setCarrierName(data.carrier_name ?? carrierName);
      setCarrierId(data.carrier_id ?? null);
      setShippingRates(data.shipping_rates ?? []);
      setZoneLocalities(data.zone_localities ?? {});
      setShippingOptionNames(data.shipping_option_names ?? []);
      setShippingSyncMessage(data.shipping_sync_message ?? null);
      setLoadError(null);
      return { success: true, syncMessage: data.shipping_sync_message };
    } catch {
      return { success: false };
    } finally {
      setSaving(false);
    }
  };

  const saveShippingConfig = async (payload: {
    carrier_name: string;
    shipping_rates: ShippingRateRule[];
  }) => {
    setSaving(true);

    try {
      const data = await updateStoreSettings(payload);
      setCarrierName(data.carrier_name ?? payload.carrier_name);
      setCarrierId(data.carrier_id ?? null);
      setShippingRates(data.shipping_rates ?? []);
      setZoneLocalities(data.zone_localities ?? {});
      setShippingOptionNames(data.shipping_option_names ?? []);
      setShippingSyncMessage(data.shipping_sync_message ?? null);
      setLoadError(null);
      return { success: true, syncMessage: data.shipping_sync_message };
    } catch {
      return { success: false };
    } finally {
      setSaving(false);
    }
  };

  const saveZoneLocalities = async (localities: ZoneLocalitiesMap) => {
    setSaving(true);

    try {
      const data = await updateStoreSettings({ zone_localities: localities });
      setZoneLocalities(data.zone_localities ?? {});
      setLoadError(null);
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      setSaving(false);
    }
  };

  return {
    enabled,
    connected,
    carrierName,
    carrierId,
    shippingRates,
    zoneLocalities,
    shippingOptionNames,
    shippingSyncMessage,
    loading,
    saving,
    loadError,
    toggleEnabled,
    saveShippingConfig,
    saveZoneLocalities,
    reloadSettings: loadSettings,
  };
};
