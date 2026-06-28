import { useCallback, useEffect, useState } from "react";

import {
  fetchStoreSettings,
  updateStoreSettings,
} from "@/services/settings.api";

export const useStoreSettings = () => {
  const [enabled, setEnabled] = useState(false);
  const [connected, setConnected] = useState(true);
  const [shippingOptionNames, setShippingOptionNames] = useState<string[]>([]);
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
      setShippingOptionNames(data.shipping_option_names ?? []);
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
        shipping_option_names: shippingOptionNames,
      });
      setEnabled(data.enabled);
      setConnected(data.connected);
      setShippingOptionNames(data.shipping_option_names ?? []);
      setLoadError(null);
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveShippingOptionNames = async (names: string[]) => {
    setSaving(true);

    try {
      const data = await updateStoreSettings({
        shipping_option_names: names,
      });
      setShippingOptionNames(data.shipping_option_names ?? []);
      setLoadError(null);
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    enabled,
    connected,
    shippingOptionNames,
    loading,
    saving,
    loadError,
    toggleEnabled,
    saveShippingOptionNames,
    reloadSettings: loadSettings,
  };
};
