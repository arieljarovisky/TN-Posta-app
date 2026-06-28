import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { navigateHeader } from "@tiendanube/nexo";
import { Layout, Page } from "@nimbus-ds/patterns";
import {
  Alert,
  Box,
  Button,
  Card,
  Input,
  Label,
  Modal,
  Spinner,
  Tag,
  Text,
  useToast,
} from "@nimbus-ds/components";

import { nexo } from "@/app";
import { Responsive } from "@/components";
import { createShipment, fetchEligibleOrders } from "@/services/shipments.api";
import { OrderSummary } from "@/types/api";

const Orders = () => {
  const { t } = useTranslation("translations");
  const { addToast } = useToast();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [notes, setNotes] = useState("");

  const showToast = (type: "success" | "danger", text: string) => {
    addToast({
      id: crypto.randomUUID(),
      type,
      text,
      duration: 4000,
    });
  };

  const loadOrders = useCallback(async () => {
    setLoading(true);

    try {
      const data = await fetchEligibleOrders();
      setOrders(data.filter((order) => !order.has_shipment));
    } catch {
      showToast("danger", t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    navigateHeader(nexo, { goTo: "/", text: t("app.backHome") });
    loadOrders();
  }, [loadOrders, t]);

  const handleCreateShipment = async () => {
    if (!selectedOrder) {
      return;
    }

    setCreating(true);

    try {
      await createShipment(selectedOrder.id, notes || undefined);
      showToast("success", `Envio creado para pedido #${selectedOrder.number}`);
      setSelectedOrder(null);
      setNotes("");
      await loadOrders();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { description?: string } } })?.response
          ?.data?.description ?? t("errors.generic");

      showToast("danger", message);
    } finally {
      setCreating(false);
    }
  };

  const renderOrderCard = (order: OrderSummary) => (
    <Card key={order.id}>
      <Card.Header title={`Pedido #${order.number}`} />
      <Card.Body>
        <Box display="flex" flexDirection="column" gap="1">
          <Text fontWeight="medium">{order.recipient_name}</Text>
          <Text>
            {order.destination.street} {order.destination.number}
            {order.destination.floor ? `, ${order.destination.floor}` : ""}
          </Text>
          <Text>
            {order.destination.city}, {order.destination.province} - CP{" "}
            {order.destination.zipcode}
          </Text>
          {order.zone_eligibility.zone && (
            <Tag appearance="success">
              {t("orders.zone")}: {order.zone_eligibility.zone}
            </Tag>
          )}
        </Box>
      </Card.Body>
      {!order.has_shipment && (
        <Card.Footer>
          <Button appearance="primary" onClick={() => setSelectedOrder(order)}>
            {t("orders.createShipment")}
          </Button>
        </Card.Footer>
      )}
    </Card>
  );

  return (
    <Page>
      <Page.Header title={t("orders.title")} />
      <Page.Body px={{ xs: "none", md: "6" }}>
        <Layout columns="1">
          <Layout.Section>
            {loading && (
              <Box display="flex" justifyContent="center" padding="4">
                <Spinner size="large" />
              </Box>
            )}

            {!loading && orders.length === 0 && (
              <Alert appearance="neutral" title={t("orders.empty")}>
                <Text>{t("orders.empty")}</Text>
              </Alert>
            )}

            {!loading && orders.length > 0 && (
              <Responsive
                mobileContent={
                  <Box display="flex" flexDirection="column" gap="3">
                    {orders.map(renderOrderCard)}
                  </Box>
                }
                desktopContent={
                  <Box
                    display="grid"
                    gap="3"
                    gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))"
                  >
                    {orders.map(renderOrderCard)}
                  </Box>
                }
              />
            )}
          </Layout.Section>
        </Layout>
      </Page.Body>

      <Modal open={Boolean(selectedOrder)} onDismiss={() => setSelectedOrder(null)}>
        <Modal.Header title={`Crear envio - Pedido #${selectedOrder?.number}`} />
        <Modal.Body padding="none">
          <Box padding="4" display="flex" flexDirection="column" gap="3">
            <Text>
              {selectedOrder?.recipient_name} - {selectedOrder?.destination.city}
            </Text>
            <Box display="flex" flexDirection="column" gap="1">
              <Label htmlFor="notes">{t("orders.notes")}</Label>
              <Input
                id="notes"
                name="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Box>
          </Box>
        </Modal.Body>
        <Modal.Footer>
          <Button appearance="neutral" onClick={() => setSelectedOrder(null)}>
            {t("orders.cancel")}
          </Button>
          <Button
            appearance="primary"
            disabled={creating}
            onClick={handleCreateShipment}
          >
            {creating ? <Spinner size="small" /> : t("orders.confirm")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Page>
  );
};

export default Orders;
