import { useCallback, useEffect, useState } from "react";

import {
  fetchStoreSettings,
  updateStoreSettings,
} from "@/services/settings.api";
import { ShippingRateRule, ZoneLocalitiesMap } from "@/types/shipping";
import { SenderConfig } from "@/services/settings.api";

export const useStoreSettings = () => {
  const [enabled, setEnabled] = useState(false);
  const [connected, setConnected] = useState(true);
  const [carrierName, setCarrierName] = useState("TN Posta");
  const [carrierId, setCarrierId] = useState<number | null>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRateRule[]>([]);
  const [zoneLocalities, setZoneLocalities] = useState<ZoneLocalitiesMap>({});
  const [sender, setSender] = useState<SenderConfig>({ business_name: "TN Posta" });
  const [trackingPageEnabled, setTrackingPageEnabled] = useState(false);
  const [trackingPageTitle, setTrackingPageTitle] = useState("Seguimiento de envio");
  const [trackingPageUrl, setTrackingPageUrl] = useState("");
  const [trackingPagePublicUrl, setTrackingPagePublicUrl] = useState<string | null>(null);
  const [trackingPageSyncMessage, setTrackingPageSyncMessage] = useState<string | null>(null);
  const [trackingPageEmbedHtml, setTrackingPageEmbedHtml] = useState("");
  const [storePublicUrl, setStorePublicUrl] = useState<string | null>(null);
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
      setSender(data.sender ?? { business_name: data.carrier_name ?? "TN Posta" });
      setTrackingPageEnabled(data.tracking_page_enabled ?? false);
      setTrackingPageTitle(data.tracking_page_title ?? "Seguimiento de envio");
      setTrackingPageUrl(data.tracking_page_url ?? "");
      setTrackingPagePublicUrl(data.tracking_page_public_url ?? null);
      setTrackingPageSyncMessage(data.tracking_page_sync_message ?? null);
      setTrackingPageEmbedHtml(data.tracking_page_embed_html ?? "");
      setStorePublicUrl(data.store_public_url ?? null);
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
      setSender(data.sender ?? { business_name: data.carrier_name ?? "TN Posta" });
      setTrackingPageEnabled(data.tracking_page_enabled ?? false);
      setTrackingPageTitle(data.tracking_page_title ?? "Seguimiento de envio");
      setTrackingPageUrl(data.tracking_page_url ?? "");
      setTrackingPagePublicUrl(data.tracking_page_public_url ?? null);
      setTrackingPageSyncMessage(data.tracking_page_sync_message ?? null);
      setTrackingPageEmbedHtml(data.tracking_page_embed_html ?? "");
      setStorePublicUrl(data.store_public_url ?? null);
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
      setSender(data.sender ?? { business_name: data.carrier_name ?? "TN Posta" });
      setTrackingPageEnabled(data.tracking_page_enabled ?? false);
      setTrackingPageTitle(data.tracking_page_title ?? "Seguimiento de envio");
      setTrackingPageUrl(data.tracking_page_url ?? "");
      setTrackingPagePublicUrl(data.tracking_page_public_url ?? null);
      setTrackingPageSyncMessage(data.tracking_page_sync_message ?? null);
      setTrackingPageEmbedHtml(data.tracking_page_embed_html ?? "");
      setStorePublicUrl(data.store_public_url ?? null);
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
      setSender(data.sender ?? { business_name: data.carrier_name ?? "TN Posta" });
      setTrackingPageEnabled(data.tracking_page_enabled ?? false);
      setTrackingPageTitle(data.tracking_page_title ?? "Seguimiento de envio");
      setTrackingPageUrl(data.tracking_page_url ?? "");
      setTrackingPagePublicUrl(data.tracking_page_public_url ?? null);
      setTrackingPageSyncMessage(data.tracking_page_sync_message ?? null);
      setTrackingPageEmbedHtml(data.tracking_page_embed_html ?? "");
      setStorePublicUrl(data.store_public_url ?? null);
      setLoadError(null);
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      setSaving(false);
    }
  };

  const saveSenderConfig = async (payload: SenderConfig) => {
    setSaving(true);

    try {
      const data = await updateStoreSettings({ sender: payload });
      setSender(data.sender ?? payload);
      setLoadError(null);
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      setSaving(false);
    }
  };

  const saveTrackingPageConfig = async (payload: {
    tracking_page_enabled: boolean;
    tracking_page_title: string;
  }) => {
    setSaving(true);

    try {
      const data = await updateStoreSettings(payload);
      setTrackingPageEnabled(data.tracking_page_enabled ?? false);
      setTrackingPageTitle(data.tracking_page_title ?? "Seguimiento de envio");
      setTrackingPageUrl(data.tracking_page_url ?? "");
      setTrackingPagePublicUrl(data.tracking_page_public_url ?? null);
      setTrackingPageSyncMessage(data.tracking_page_sync_message ?? null);
      setTrackingPageEmbedHtml(data.tracking_page_embed_html ?? "");
      setStorePublicUrl(data.store_public_url ?? null);
      setLoadError(null);
      return {
        success: true,
        syncMessage: data.tracking_page_sync_message,
        syncOk: data.tracking_page_sync_ok,
      };
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
    sender,
    trackingPageEnabled,
    trackingPageTitle,
    trackingPageUrl,
    trackingPagePublicUrl,
    trackingPageSyncMessage,
    trackingPageEmbedHtml,
    storePublicUrl,
    shippingOptionNames,
    shippingSyncMessage,
    loading,
    saving,
    loadError,
    toggleEnabled,
    saveShippingConfig,
    saveZoneLocalities,
    saveSenderConfig,
    saveTrackingPageConfig,
    reloadSettings: loadSettings,
  };
};
