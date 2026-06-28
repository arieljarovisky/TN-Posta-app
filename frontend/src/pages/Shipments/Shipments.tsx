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
  Spinner,
  Tag,
  Text,
  useToast,
} from "@nimbus-ds/components";
import { DownloadIcon } from "@nimbus-ds/icons";

import { nexo } from "@/app";
import { Responsive } from "@/components";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import {
  downloadShipmentLabel,
  fetchShipments,
} from "@/services/shipments.api";
import { Shipment } from "@/types/api";

const Shipments = () => {
  const { t } = useTranslation("translations");
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { enabled: serviceEnabled, loading: settingsLoading } = useStoreSettings();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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

    try {
      setShipments(await fetchShipments());
    } catch {
      showToast("danger", t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    navigateHeader(nexo, { goTo: "/", text: t("app.backHome") });

    if (!settingsLoading && serviceEnabled) {
      loadShipments();
      return;
    }

    if (!settingsLoading) {
      setLoading(false);
    }
  }, [loadShipments, serviceEnabled, settingsLoading, t]);

  const handleDownload = async (shipment: Shipment) => {
    setDownloadingId(shipment.id);

    try {
      await downloadShipmentLabel(shipment.id, shipment.order_number);
      showToast("success", `Etiqueta descargada - pedido #${shipment.order_number}`);
      await loadShipments();
    } catch {
      showToast("danger", t("errors.generic"));
    } finally {
      setDownloadingId(null);
    }
  };

  const renderShipmentCard = (shipment: Shipment) => (
    <Card key={shipment.id}>
      <Card.Header title={`${t("shipments.order")} #${shipment.order_number}`} />
      <Card.Body>
        <Box display="flex" flexDirection="column" gap="1">
          <Text fontWeight="medium">{shipment.recipient.name}</Text>
          <Text>
            {shipment.destination.street} {shipment.destination.number},{" "}
            {shipment.destination.city}
          </Text>
          <Tag appearance="primary">
            {t("shipments.zone")}: {shipment.zone}
          </Tag>
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
          disabled={downloadingId === shipment.id}
          onClick={() => handleDownload(shipment)}
        >
          {downloadingId === shipment.id ? (
            <Spinner size="small" />
          ) : (
            <DownloadIcon size="small" />
          )}
          {t("shipments.downloadLabel")}
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

            {!loading && !settingsLoading && serviceEnabled && shipments.length === 0 && (
              <Alert appearance="neutral" title={t("shipments.empty")}>
                <Text>{t("shipments.empty")}</Text>
              </Alert>
            )}

            {!loading && !settingsLoading && serviceEnabled && shipments.length > 0 && (
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
