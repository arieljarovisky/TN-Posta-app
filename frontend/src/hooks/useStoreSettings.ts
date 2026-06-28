import { useCallback, useEffect, useState } from "react";

import {
  fetchStoreSettings,
  updateStoreSettings,
} from "@/services/settings.api";

export const useStoreSettings = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);

    try {
      const data = await fetchStoreSettings();
      setEnabled(data.enabled);
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
      const data = await updateStoreSettings(nextEnabled);
      setEnabled(data.enabled);
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    enabled,
    loading,
    saving,
    toggleEnabled,
    reloadSettings: loadSettings,
  };
};
