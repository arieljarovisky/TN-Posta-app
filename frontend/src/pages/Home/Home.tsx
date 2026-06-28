import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { navigateHeaderRemove } from "@tiendanube/nexo";
import { Layout, Page } from "@nimbus-ds/patterns";
import { Box, Button, Card, Text, Title } from "@nimbus-ds/components";
import { LocationIcon, TruckIcon } from "@nimbus-ds/icons";

import { nexo } from "@/app";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("translations");

  useEffect(() => {
    navigateHeaderRemove(nexo);
  }, []);

  return (
    <Page>
      <Page.Header title={t("app.title")} />
      <Page.Body>
        <Layout columns="1">
          <Layout.Section>
            <Box display="flex" flexDirection="column" gap="4">
              <Text>{t("home.description")}</Text>

              <Card>
                <Card.Header title={t("home.ordersCard")} />
                <Card.Body>
                  <Text>
                    Lista pedidos con direccion en CABA o GBA listos para crear
                    un envio personalizado.
                  </Text>
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
                  <Text>
                    Consulta envios ya creados y descarga las etiquetas en PDF.
                  </Text>
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

              <Box paddingY="2">
                <Title as="h6">Cobertura</Title>
                <Text>Capital Federal y Gran Buenos Aires unicamente.</Text>
              </Box>
            </Box>
          </Layout.Section>
        </Layout>
      </Page.Body>
    </Page>
  );
};

export default Home;
