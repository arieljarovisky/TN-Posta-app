import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { navigateHeaderRemove } from "@tiendanube/nexo";
import { Layout, Page } from "@nimbus-ds/patterns";
import {
  Alert,
  Box,
  Button,
  Card,
  Text,
  Title,
  useToast,
} from "@nimbus-ds/components";
import { LocationIcon, TruckIcon } from "@nimbus-ds/icons";

import { nexo } from "@/app";
import {
  clearInstallParamsFromUrl,
  getInstallStatusFromUrl,
} from "@/app/oauth/oauthInstall";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("translations");
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    navigateHeaderRemove(nexo);
  }, []);

  useEffect(() => {
    const status = getInstallStatusFromUrl();

    if (status.installed) {
      addToast({
        id: crypto.randomUUID(),
        type: "success",
        text: "Aplicacion instalada correctamente.",
        duration: 5000,
      });
      clearInstallParamsFromUrl();
    }

    if (status.missingCode) {
      addToast({
        id: crypto.randomUUID(),
        type: "danger",
        text: "Falta el codigo de autorizacion. Reinstala la app desde el portal.",
        duration: 6000,
      });
      clearInstallParamsFromUrl();
    }

    if (status.error) {
      addToast({
        id: crypto.randomUUID(),
        type: "danger",
        text: decodeURIComponent(status.error),
        duration: 6000,
      });
      clearInstallParamsFromUrl();
    }
  }, [addToast, searchParams]);

  return (
    <Page>
      <Page.Header title={t("app.title")} />
      <Page.Body>
        <Layout columns="1">
          <Layout.Section>
            <Box display="flex" flexDirection="column" gap="4">
              <Text>{t("home.description")}</Text>

              <Alert appearance="neutral" title="Primera vez?">
                <Text>
                  Si la app abre directo sin pedir permisos, desinstalala desde
                  la tienda Lupo (Apps → Posta → Desinstalar) y volve a
                  instalar desde el portal de socios.
                </Text>
              </Alert>

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
