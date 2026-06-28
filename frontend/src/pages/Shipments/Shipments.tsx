import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { navigateHeader } from "@tiendanube/nexo";
import { Layout, Page } from "@nimbus-ds/patterns";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Spinner,
  Tag,
  Text,
  useToast,
} from "@nimbus-ds/components";
import { DownloadIcon } from "@nimbus-ds/icons";

import { nexo } from "@/app";
import { ReinstallStoreAlert, Responsive } from "@/components";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import {
  fetchShipments,
  printShipmentLabel,
  printShipmentLabelsBulk,
} from "@/services/shipments.api";
import { Shipment } from "@/types/api";

const isUnauthorizedError = (error: unknown): boolean =>
  (error as { response?: { status?: number } })?.response?.status === 401;

const Shipments = () => {
  const { t } = useTranslation("translations");
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { enabled: serviceEnabled, loading: settingsLoading, connected } =
    useStoreSettings();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsReconnect, setNeedsReconnect] = useState(false);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [printingBulk, setPrintingBulk] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const showToast = (type: "success" | "danger", text: string) => {
    addToast({
      id: crypto.randomUUID(),
      type,
      text,
      duration: 4000,
    });
  };

  const loadShipments = useCallback(async () => {
    setLoading(true);
    setNeedsReconnect(false);

    try {
      setShipments(await fetchShipments());
      setSelectedIds([]);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        setNeedsReconnect(true);
        setShipments([]);
        return;
      }

      showToast("danger", t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    navigateHeader(nexo, { goTo: "/", text: t("app.backHome") });

    if (!settingsLoading && serviceEnabled && connected) {
      loadShipments();
      return;
    }

    if (!settingsLoading) {
      setLoading(false);
      setNeedsReconnect(!connected && serviceEnabled);
    }
  }, [connected, loadShipments, serviceEnabled, settingsLoading, t]);

  const toggleSelection = (shipmentId: string) => {
    setSelectedIds((current) =>
      current.includes(shipmentId)
        ? current.filter((id) => id !== shipmentId)
        : [...current, shipmentId]
    );
  };

  const handlePrint = async (shipment: Shipment) => {
    setPrintingId(shipment.id);

    try {
      await printShipmentLabel(shipment);
      showToast("success", `Etiqueta lista - pedido #${shipment.order_number}`);
      await loadShipments();
    } catch {
      showToast("danger", t("errors.generic"));
    } finally {
      setPrintingId(null);
    }
  };

  const handlePrintBulk = async () => {
    const selected = shipments.filter((shipment) =>
      selectedIds.includes(shipment.id)
    );

    if (selected.length === 0) {
      return;
    }

    setPrintingBulk(true);

    try {
      await printShipmentLabelsBulk(selected);
      showToast(
        "success",
        `${selected.length} etiqueta${selected.length !== 1 ? "s" : ""} lista${selected.length !== 1 ? "s" : ""} para imprimir`
      );
      await loadShipments();
    } catch {
      showToast("danger", t("errors.generic"));
    } finally {
      setPrintingBulk(false);
    }
  };

  const renderShipmentCard = (shipment: Shipment) => (
    <Card key={shipment.id}>
      <Card.Header title={`${t("shipments.order")} #${shipment.order_number}`} />
      <Card.Body>
        <Box display="flex" flexDirection="column" gap="2">
          <Checkbox
            name={`select-${shipment.id}`}
            label="Seleccionar para impresion masiva"
            checked={selectedIds.includes(shipment.id)}
            onChange={() => toggleSelection(shipment.id)}
          />
          <Text fontWeight="medium">{shipment.recipient.name}</Text>
          <Text>
            {shipment.destination.street} {shipment.destination.number},{" "}
            {shipment.destination.city}
          </Text>
          <Tag appearance="primary">
            {t("shipments.zone")}: {shipment.zone}
          </Tag>
          {shipment.tracking_code && (
            <Tag appearance="success">
              {t("shipments.trackingCode")}: {shipment.tracking_code}
            </Tag>
          )}
          <Tag appearance="neutral">
            {t("shipments.status")}:{" "}
            {shipment.status === "label_generated"
              ? t("shipments.labelGenerated")
              : t("shipments.created")}
          </Tag>
        </Box>
      </Card.Body>
      <Card.Footer>
        <Button
          appearance="primary"
          disabled={printingId === shipment.id || printingBulk}
          onClick={() => handlePrint(shipment)}
        >
          {printingId === shipment.id ? (
            <Spinner size="small" />
          ) : (
            <DownloadIcon size="small" />
          )}
          {t("shipments.printLabel")}
        </Button>
      </Card.Footer>
    </Card>
  );

  return (
    <Page>
      <Page.Header title={t("shipments.title")} />
      <Page.Body px={{ xs: "none", md: "6" }}>
        <Layout columns="1">
          <Layout.Section>
            {(settingsLoading || loading) && (
              <Box display="flex" justifyContent="center" padding="4">
                <Spinner size="large" />
              </Box>
            )}

            {!settingsLoading && !serviceEnabled && (
              <Alert appearance="warning" title={t("home.inactiveAlertTitle")}>
                <Box display="flex" flexDirection="column" gap="3">
                  <Text>{t("shipments.serviceDisabled")}</Text>
                  <Button appearance="primary" onClick={() => navigate("/")}>
                    {t("app.backHome")}
                  </Button>
                </Box>
              </Alert>
            )}

            {!loading && !settingsLoading && serviceEnabled && needsReconnect && (
              <ReinstallStoreAlert
                title={t("home.reconnectTitle")}
                description={t("shipments.reconnectRequired")}
              />
            )}

            {!loading && !settingsLoading && serviceEnabled && !needsReconnect && shipments.length > 0 && (
              <Box display="flex" flexDirection="column" gap="3" paddingBottom="3">
                <Alert appearance="neutral" title={t("shipments.labelHelpTitle")}>
                  <Text>{t("shipments.labelHelpBody")}</Text>
                </Alert>
                {selectedIds.length > 0 && (
                  <Box>
                    <Button
                      appearance="primary"
                      disabled={printingBulk}
                      onClick={handlePrintBulk}
                    >
                      {printingBulk ? (
                        <Spinner size="small" />
                      ) : (
                        t("shipments.printSelected", { count: selectedIds.length })
                      )}
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {!loading && !settingsLoading && serviceEnabled && !needsReconnect && shipments.length === 0 && (
              <Alert appearance="neutral" title={t("shipments.empty")}>
                <Text>{t("shipments.empty")}</Text>
              </Alert>
            )}

            {!loading && !settingsLoading && serviceEnabled && !needsReconnect && shipments.length > 0 && (
              <Responsive
                mobileContent={
                  <Box display="flex" flexDirection="column" gap="3">
                    {shipments.map(renderShipmentCard)}
                  </Box>
                }
                desktopContent={
                  <Box
                    display="grid"
                    gap="3"
                    gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))"
                  >
                    {shipments.map(renderShipmentCard)}
                  </Box>
                }
              />
            )}
          </Layout.Section>
        </Layout>
      </Page.Body>
    </Page>
  );
};

export default Shipments;
