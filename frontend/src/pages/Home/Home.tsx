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
  Spinner,
  Tag,
  Text,
  Title,
  Toggle,
  useToast,
} from "@nimbus-ds/components";
import { LocationIcon, TruckIcon } from "@nimbus-ds/icons";

import { nexo } from "@/app";
import { ReinstallStoreAlert, ShippingRatesEditor } from "@/components";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { ShippingRateRule } from "@/types/shipping";
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
    shippingRates,
    shippingSyncMessage,
    toggleEnabled,
    saveShippingConfig,
    reloadSettings,
  } = useStoreSettings();
  const [carrierNameInput, setCarrierNameInput] = useState("TN Posta");
  const [ratesInput, setRatesInput] = useState<ShippingRateRule[]>([]);

  useEffect(() => {
    setCarrierNameInput(carrierName);
    setRatesInput(shippingRates);
  }, [carrierName, shippingRates]);

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
                  <ShippingRatesEditor
                    carrierName={carrierNameInput}
                    rates={ratesInput}
                    disabled={saving || loading}
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

              <Box paddingY="2">
                <Title as="h6">{t("home.coverageTitle")}</Title>
                <Text>{t("home.coverageBody")}</Text>
              </Box>
            </Box>
          </Layout.Section>
        </Layout>
      </Page.Body>
    </Page>
  );
};

export default Home;
