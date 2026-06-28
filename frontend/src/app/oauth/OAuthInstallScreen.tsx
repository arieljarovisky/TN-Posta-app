import { Alert, Box, Button, Text, Title } from "@nimbus-ds/components";

import {
  getOAuthInstallUrl,
  getStoreAppsUrl,
  getTiendanubeAdminUrl,
  openOAuthInstallUrl,
} from "./installUi";
import { clearInstallParamsFromUrl } from "./oauthInstall";

type OAuthInstallScreenProps = {
  variant: "missing_code" | "error" | "success" | "standalone";
  errorMessage?: string;
};

const OAuthInstallScreen = ({
  variant,
  errorMessage,
}: OAuthInstallScreenProps) => {
  const adminUrl = getTiendanubeAdminUrl();
  const appsUrl = getStoreAppsUrl();
  const oauthUrl = getOAuthInstallUrl();
  const callbackUrl = `${window.location.origin}/auth/install`;
  const appUrl = window.location.origin;

  const titles: Record<OAuthInstallScreenProps["variant"], string> = {
    missing_code: "Falta autorizacion de Tiendanube",
    error: "Error al conectar la tienda",
    success: "Tienda conectada correctamente",
    standalone: "TN Posta — Instalar app",
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
      padding="4"
      paddingTop="6"
    >
      <Box
        display="flex"
        flexDirection="column"
        gap="4"
        maxWidth="560px"
        width="100%"
      >
        <Title as="h3">{titles[variant]}</Title>

        {variant === "success" ? (
          <>
            <Alert appearance="success" title="Listo">
              <Text>
                La tienda quedo autorizada. Abri TN Posta desde Apps en tu
                administrador de Tiendanube.
              </Text>
            </Alert>
            <Button as="a" appearance="primary" href={adminUrl}>
              Abrir TN Posta en mi tienda
            </Button>
            <Button
              appearance="neutral"
              onClick={() => {
                clearInstallParamsFromUrl();
                window.location.reload();
              }}
            >
              Continuar aqui
            </Button>
          </>
        ) : (
          <>
            <Alert appearance="warning" title="La app no esta instalada">
              <Text>
                {variant === "missing_code"
                  ? "Tiendanube no devolvio el codigo OAuth. Si ves una pagina en blanco en lupo24.../authorize, casi siempre es porque las URLs del Partner Portal no estan bien configuradas."
                  : (errorMessage ??
                    "No se pudo completar la instalacion.")}
              </Text>
            </Alert>

            <Box display="flex" flexDirection="column" gap="2">
              <Text fontWeight="medium">Paso 1 — Partner Portal (obligatorio)</Text>
              <Text fontSize="caption" color="neutral-textLow">
                En partners.tiendanube.com → App TN Posta → Datos basicos →
                URLs, configura exactamente:
              </Text>
              <Box
                padding="3"
                backgroundColor="neutral-surface"
                borderRadius="2"
                display="flex"
                flexDirection="column"
                gap="1"
              >
                <Text fontSize="caption">
                  <strong>URL de la aplicacion:</strong> {appUrl}
                </Text>
                <Text fontSize="caption">
                  <strong>URL redirect post-instalacion:</strong> {callbackUrl}
                </Text>
              </Box>
              <Text fontSize="caption" color="neutral-textLow">
                No uses la URL default del portal de partners. Debe ser tu
                dominio Railway con /auth/install.
              </Text>
            </Box>

            <Box display="flex" flexDirection="column" gap="2">
              <Text fontWeight="medium">Paso 2 — Instalar desde Tiendanube</Text>
              <Text fontSize="caption" color="neutral-textLow">
                Con las URLs guardadas, abri el link oficial de instalacion
                (logueado en Lupo24):
              </Text>
              <Button appearance="primary" onClick={openOAuthInstallUrl}>
                Instalar / Autorizar con Tiendanube
              </Button>
              <Text fontSize="caption" color="neutral-textLow">
                Deberias ver pantalla de permisos → luego volver aca con
                instalacion OK. Si ves pagina en blanco, revisa el Paso 1.
              </Text>
            </Box>

            <Box display="flex" flexDirection="column" gap="2">
              <Text fontWeight="medium">Alternativa — desde el admin Lupo24</Text>
              <Button as="a" appearance="neutral" href={appsUrl}>
                Ir a Apps en lupo24.mitiendanube.com
              </Button>
              <Text fontSize="caption" color="neutral-textLow">
                Busca TN Posta → Instalar. Si no aparece, la app esta en
                desarrollo: usa el boton azul de arriba o activa Modo
                Desarrollador en la tienda.
              </Text>
            </Box>

            <Box
              padding="3"
              backgroundColor="neutral-surface"
              borderRadius="2"
              display="flex"
              flexDirection="column"
              gap="1"
            >
              <Text fontSize="caption" color="neutral-textLow">
                Link OAuth: <strong>{oauthUrl}</strong>
              </Text>
              <Text fontSize="caption" color="neutral-textLow">
                Railway: agrega{" "}
                <strong>STORE_SLUG=lupo24</strong> y{" "}
                <strong>
                  APP_PUBLIC_URL=https://tn-posta-app-production.up.railway.app
                </strong>
              </Text>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default OAuthInstallScreen;
