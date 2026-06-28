import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { navigateHeaderRemove } from "@tiendanube/nexo";
import { Layout, Page } from "@nimbus-ds/patterns";
import {
  Alert,
  Box,
  Button,
  Card,
  Input,
  Label,
  Spinner,
  Tag,
  Text,
  Title,
  Toggle,
  useToast,
} from "@nimbus-ds/components";
import { LocationIcon, TruckIcon } from "@nimbus-ds/icons";

import { nexo } from "@/app";
import { ReinstallStoreAlert, ShippingPublishAlert, ShippingRatesEditor, TrackingPagePanel, ZoneCoveragePanel } from "@/components";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useZoneCoverage } from "@/hooks/useZoneCoverage";
import { ShippingRateRule, ZoneLocalitiesMap } from "@/types/shipping";
import { SenderConfig } from "@/services/settings.api";
import {
  clearInstallParamsFromUrl,
  getInstallStatusFromUrl,
} from "@/app/oauth/oauthInstall";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("translations");
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const {
    enabled,
    loading,
    saving,
    loadError,
    connected,
    carrierName,
    carrierId,
    shippingRates,
    shippingSyncMessage,
    zoneLocalities,
    sender,
    trackingPageEnabled,
    trackingPageTitle,
    trackingPageUrl,
    storePublicUrl,
    toggleEnabled,
    saveShippingConfig,
    saveZoneLocalities,
    saveSenderConfig,
    saveTrackingPageConfig,
    reloadSettings,
  } = useStoreSettings();
  const {
    zones: zoneCoverage,
    loading: zoneCoverageLoading,
    error: zoneCoverageError,
    reloadCoverage,
  } = useZoneCoverage();
  const [carrierNameInput, setCarrierNameInput] = useState("TN Posta");
  const [ratesInput, setRatesInput] = useState<ShippingRateRule[]>([]);
  const [zoneLocalitiesInput, setZoneLocalitiesInput] =
    useState<ZoneLocalitiesMap>({});
  const [senderInput, setSenderInput] = useState<SenderConfig>({
    business_name: "TN Posta",
  });
  const [trackingPageEnabledInput, setTrackingPageEnabledInput] = useState(false);
  const [trackingPageTitleInput, setTrackingPageTitleInput] =
    useState("Seguimiento de envio");

  useEffect(() => {
    setCarrierNameInput(carrierName);
    setRatesInput(shippingRates);
  }, [carrierName, shippingRates]);

  useEffect(() => {
    setZoneLocalitiesInput(zoneLocalities);
  }, [zoneLocalities]);

  useEffect(() => {
    setSenderInput(sender);
  }, [sender]);

  useEffect(() => {
    setTrackingPageEnabledInput(trackingPageEnabled);
    setTrackingPageTitleInput(trackingPageTitle);
  }, [trackingPageEnabled, trackingPageTitle]);

  useEffect(() => {
    if (connected) {
      return;
    }

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        reloadSettings();
      }
    };

    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [connected, reloadSettings]);

  useEffect(() => {
    const status = getInstallStatusFromUrl();

    if (status.installed) {
      addToast({
        id: crypto.randomUUID(),
        type: "success",
        text: "Aplicacion instalada correctamente.",
        duration: 4000,
      });
      clearInstallParamsFromUrl();
    }

    if (status.missingCode) {
      addToast({
        id: crypto.randomUUID(),
        type: "danger",
        text: "Falta el codigo de autorizacion. Reinstala la app desde el portal.",
        duration: 8000,
      });
      clearInstallParamsFromUrl();
    }

    if (status.error) {
      addToast({
        id: crypto.randomUUID(),
        type: "danger",
        text: decodeURIComponent(status.error),
        duration: 8000,
      });
      clearInstallParamsFromUrl();
    }
  }, [addToast, searchParams]);

  useEffect(() => {
    navigateHeaderRemove(nexo);
  }, []);

  const handleSaveShippingConfig = async () => {
    const validRates = ratesInput.filter((rate) => rate.name.trim());

    if (validRates.length === 0) {
      addToast({
        id: crypto.randomUUID(),
        type: "danger",
        text: t("home.shippingRatesRequired"),
        duration: 4000,
      });
      return;
    }

    const result = await saveShippingConfig({
      carrier_name: carrierNameInput.trim() || "TN Posta",
      shipping_rates: validRates,
    });

    if (result.success) {
      addToast({
        id: crypto.randomUUID(),
        type: "success",
        text: t("home.shippingRatesSaved"),
        duration: 4000,
      });

      if (result.syncMessage) {
        addToast({
          id: crypto.randomUUID(),
          type: "primary",
          text: result.syncMessage,
          duration: 8000,
        });
      }

      return;
    }

    addToast({
      id: crypto.randomUUID(),
      type: "danger",
      text: t("errors.generic"),
      duration: 4000,
    });
  };

  const handleSaveSender = async () => {
    const result = await saveSenderConfig({
      business_name: senderInput.business_name.trim() || "TN Posta",
      address: senderInput.address?.trim(),
      city: senderInput.city?.trim(),
      phone: senderInput.phone?.trim(),
    });

    if (result.success) {
      addToast({
        id: crypto.randomUUID(),
        type: "success",
        text: t("home.senderSaved"),
        duration: 4000,
      });
      return;
    }

    addToast({
      id: crypto.randomUUID(),
      type: "danger",
      text: t("errors.generic"),
      duration: 4000,
    });
  };

  const handleSaveTrackingPage = async () => {
    const result = await saveTrackingPageConfig({
      tracking_page_enabled: trackingPageEnabledInput,
      tracking_page_title:
        trackingPageTitleInput.trim() || "Seguimiento de envio",
    });

    if (result.success) {
      addToast({
        id: crypto.randomUUID(),
        type: "success",
        text: t("home.trackingPageSaved"),
        duration: 4000,
      });
      return;
    }

    addToast({
      id: crypto.randomUUID(),
      type: "danger",
      text: t("errors.generic"),
      duration: 4000,
    });
  };

  const buildZoneLocalitiesPayload = (): ZoneLocalitiesMap =>
    zoneCoverage.reduce((acc, zone) => {
      acc[zone.zone] =
        zoneLocalitiesInput[zone.zone] ?? zone.localities ?? [];
      return acc;
    }, {} as ZoneLocalitiesMap);

  const handleSaveZoneLocalities = async () => {
    const payload = buildZoneLocalitiesPayload();
    const hasEmptyZone = zoneCoverage.some(
      (zone) => !payload[zone.zone]?.length
    );

    if (hasEmptyZone) {
      addToast({
        id: crypto.randomUUID(),
        type: "danger",
        text: t("home.coverageEmptyZone"),
        duration: 4000,
      });
      return;
    }

    const result = await saveZoneLocalities(payload);

    if (result.success) {
      await reloadCoverage();
      addToast({
        id: crypto.randomUUID(),
        type: "success",
        text: t("home.coverageSaved"),
        duration: 4000,
      });
      return;
    }

    addToast({
      id: crypto.randomUUID(),
      type: "danger",
      text: t("errors.generic"),
      duration: 4000,
    });
  };

  const handleToggle = async () => {
    const success = await toggleEnabled(!enabled);

    if (success) {
      addToast({
        id: crypto.randomUUID(),
        type: "success",
        text: !enabled
          ? t("home.activatedToast")
          : t("home.deactivatedToast"),
        duration: 4000,
      });
      return;
    }

    addToast({
      id: crypto.randomUUID(),
      type: "danger",
      text: t("errors.generic"),
      duration: 4000,
    });
  };

  return (
    <Page>
      <Page.Header title={t("app.title")} />
      <Page.Body>
        <Layout columns="1">
          <Layout.Section>
            <Box display="flex" flexDirection="column" gap="4">
              <Text>{t("home.description")}</Text>

              {loadError && (
                <Alert appearance="danger" title="Error de configuracion">
                  <Text>{loadError}</Text>
                </Alert>
              )}

              {!loading && !connected && (
                <ReinstallStoreAlert
                  title={t("home.reconnectTitle")}
                  description={t("home.reconnectBody")}
                />
              )}

              <Card>
                <Card.Header title={t("home.serviceStatus")} />
                <Card.Body>
                  <Box display="flex" flexDirection="column" gap="4">
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      gap="4"
                    >
                      <Box display="flex" flexDirection="column" gap="1">
                        <Text fontWeight="medium">{t("home.toggleLabel")}</Text>
                        <Text fontSize="caption" color="neutral-textLow">
                          {t("home.toggleHelp")}
                        </Text>
                      </Box>

                      {loading ? (
                        <Spinner size="small" />
                      ) : (
                        <Toggle
                          name="service-enabled"
                          active={enabled}
                          disabled={saving || Boolean(loadError)}
                          onChange={handleToggle}
                        />
                      )}
                    </Box>

                    <Box display="flex" alignItems="center" gap="2">
                      <Text fontWeight="medium">{t("home.statusLabel")}</Text>
                      <Tag appearance={enabled ? "success" : "neutral"}>
                        {enabled ? t("home.statusActive") : t("home.statusInactive")}
                      </Tag>
                    </Box>

                    <Text fontSize="caption" color="neutral-textLow">
                      {enabled
                        ? t("home.activeDescription")
                        : t("home.inactiveDescription")}
                    </Text>
                  </Box>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header title={t("home.shippingRatesTitle")} />
                <Card.Body>
                  <ShippingPublishAlert
                    carrierId={carrierId}
                    carrierName={carrierName}
                    connected={connected}
                    enabled={enabled}
                    syncMessage={shippingSyncMessage}
                  />
                  <Box paddingTop="3">
                  <ShippingRatesEditor
                    carrierName={carrierNameInput}
                    rates={ratesInput}
                    disabled={saving || loading}
                    zoneCoverage={zoneCoverage}
                    zoneCoverageLoading={zoneCoverageLoading}
                    onCarrierNameChange={setCarrierNameInput}
                    onRatesChange={setRatesInput}
                    onSave={handleSaveShippingConfig}
                  />
                  {shippingSyncMessage && (
                    <Box paddingTop="3">
                      <Text fontSize="caption" color="neutral-textLow">
                        {shippingSyncMessage}
                      </Text>
                    </Box>
                  )}
                  </Box>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header title={t("home.senderTitle")} />
                <Card.Body>
                  <Box display="flex" flexDirection="column" gap="3">
                    <Text fontSize="caption" color="neutral-textLow">
                      {t("home.senderHelp")}
                    </Text>
                    <Box display="flex" flexDirection="column" gap="1">
                      <Label htmlFor="sender-business">{t("home.senderBusinessName")}</Label>
                      <Input
                        id="sender-business"
                        name="sender-business"
                        value={senderInput.business_name}
                        disabled={saving || loading}
                        onChange={(event) =>
                          setSenderInput((current) => ({
                            ...current,
                            business_name: event.target.value,
                          }))
                        }
                      />
                    </Box>
                    <Box display="flex" flexDirection="column" gap="1">
                      <Label htmlFor="sender-address">{t("home.senderAddress")}</Label>
                      <Input
                        id="sender-address"
                        name="sender-address"
                        value={senderInput.address ?? ""}
                        disabled={saving || loading}
                        onChange={(event) =>
                          setSenderInput((current) => ({
                            ...current,
                            address: event.target.value,
                          }))
                        }
                      />
                    </Box>
                    <Box display="flex" flexDirection="column" gap="1">
                      <Label htmlFor="sender-city">{t("home.senderCity")}</Label>
                      <Input
                        id="sender-city"
                        name="sender-city"
                        value={senderInput.city ?? ""}
                        disabled={saving || loading}
                        onChange={(event) =>
                          setSenderInput((current) => ({
                            ...current,
                            city: event.target.value,
                          }))
                        }
                      />
                    </Box>
                    <Box display="flex" flexDirection="column" gap="1">
                      <Label htmlFor="sender-phone">{t("home.senderPhone")}</Label>
                      <Input
                        id="sender-phone"
                        name="sender-phone"
                        value={senderInput.phone ?? ""}
                        disabled={saving || loading}
                        onChange={(event) =>
                          setSenderInput((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                      />
                    </Box>
                    <Button
                      appearance="primary"
                      disabled={saving || loading}
                      onClick={handleSaveSender}
                    >
                      {saving ? "Guardando..." : "Guardar remitente"}
                    </Button>
                  </Box>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header title={t("home.trackingPageTitle")} />
                <Card.Body>
                  <TrackingPagePanel
                    enabled={trackingPageEnabledInput}
                    title={trackingPageTitleInput}
                    pageUrl={trackingPageUrl}
                    storePublicUrl={storePublicUrl}
                    disabled={loading}
                    saving={saving}
                    onEnabledChange={setTrackingPageEnabledInput}
                    onTitleChange={setTrackingPageTitleInput}
                    onSave={handleSaveTrackingPage}
                  />
                </Card.Body>
              </Card>

              {enabled && connected && (
                <Box display="flex" flexDirection="column" gap="3">
                  <Title as="h6">{t("home.manageTitle")}</Title>

                  <Card>
                    <Card.Header title={t("home.ordersCard")} />
                    <Card.Body>
                      <Text>{t("home.ordersCardHelp")}</Text>
                    </Card.Body>
                    <Card.Footer>
                      <Button
                        appearance="primary"
                        onClick={() => navigate("/orders")}
                      >
                        <LocationIcon size="small" />
                        {t("home.ordersCard")}
                      </Button>
                    </Card.Footer>
                  </Card>

                  <Card>
                    <Card.Header title={t("home.shipmentsCard")} />
                    <Card.Body>
                      <Text>{t("home.shipmentsCardHelp")}</Text>
                    </Card.Body>
                    <Card.Footer>
                      <Button
                        appearance="neutral"
                        onClick={() => navigate("/shipments")}
                      >
                        <TruckIcon size="small" />
                        {t("home.shipmentsCard")}
                      </Button>
                    </Card.Footer>
                  </Card>
                </Box>
              )}

              {!loading && !enabled && (
                <Alert appearance="neutral" title={t("home.inactiveAlertTitle")}>
                  <Text>{t("home.inactiveAlertBody")}</Text>
                </Alert>
              )}

              <Card>
                <Card.Header title={t("home.coverageTitle")} />
                <Card.Body>
                  <ZoneCoveragePanel
                    zones={zoneCoverage}
                    loading={zoneCoverageLoading}
                    error={zoneCoverageError}
                    highlightZones={ratesInput
                      .filter((rate) => rate.active)
                      .map((rate) => rate.zone)}
                    editable
                    disabled={saving || loading}
                    saving={saving}
                    zoneLocalities={zoneLocalitiesInput}
                    onLocalitiesChange={setZoneLocalitiesInput}
                    onSave={handleSaveZoneLocalities}
                  />
                </Card.Body>
              </Card>
            </Box>
          </Layout.Section>
        </Layout>
      </Page.Body>
    </Page>
  );
};

export default Home;
