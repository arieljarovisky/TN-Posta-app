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

  const titles: Record<OAuthInstallScreenProps["variant"], string> = {
    missing_code: "Falta autorizacion de Tiendanube",
    error: "Error al conectar la tienda",
    success: "Tienda conectada correctamente",
    standalone: "TN Posta",
  };

  const descriptions: Record<OAuthInstallScreenProps["variant"], string> = {
    missing_code:
      "Tiendanube no envio el codigo OAuth. Si al autorizar te mando al dashboard de la tienda, la app ya esta instalada pero el servidor perdio las credenciales. Usa el boton azul (URL oficial de OAuth) o desinstala TN Posta y volve a instalar.",
    error:
      errorMessage ??
      "No se pudo completar la instalacion. Intenta autorizar la app nuevamente.",
    success:
      "La tienda quedo autorizada. Abri TN Posta desde el administrador de tu tienda para gestionar envios.",
    standalone:
      "Esta app funciona dentro del administrador de Tiendanube. Autoriza la tienda o abrila desde Apps en tu panel.",
  };

  return (
    <Box
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="4"
    >
      <Box
        display="flex"
        flexDirection="column"
        gap="4"
        maxWidth="520px"
        width="100%"
      >
        <Title as="h3">{titles[variant]}</Title>

        <Alert
          appearance={
            variant === "success"
              ? "success"
              : variant === "standalone"
                ? "neutral"
                : "warning"
          }
          title={variant === "success" ? "Listo" : "Que hacer ahora"}
        >
          <Text>{descriptions[variant]}</Text>
        </Alert>

        {variant !== "success" && (
          <Box display="flex" flexDirection="column" gap="2">
            <Button appearance="primary" onClick={openOAuthInstallUrl}>
              Autorizar / Reconectar tienda
            </Button>
            <Text fontSize="caption" color="neutral-textLow">
              Te llevara a Tiendanube para generar un nuevo codigo. Al terminar
              volveras aca con la tienda conectada.
            </Text>
          </Box>
        )}

        <Box display="flex" flexDirection="column" gap="2">
          <Button
            as="a"
            appearance={variant === "success" ? "primary" : "neutral"}
            href={adminUrl}
          >
            {variant === "success"
              ? "Abrir TN Posta en mi tienda"
              : "Abrir TN Posta en el admin"}
          </Button>

          {variant !== "success" && (
            <Button as="a" appearance="neutral" href={appsUrl}>
              Ir a Apps para desinstalar y reinstalar
            </Button>
          )}

          {variant === "success" && (
            <Button
              appearance="neutral"
              onClick={() => {
                clearInstallParamsFromUrl();
                window.location.reload();
              }}
            >
              Continuar aqui
            </Button>
          )}
        </Box>

        {(variant === "missing_code" || variant === "error") && (
          <Box
            padding="3"
            backgroundColor="neutral-surface"
            borderRadius="2"
            display="flex"
            flexDirection="column"
            gap="2"
          >
            <Text fontWeight="medium" fontSize="caption">
              Configuracion en Partner Portal:
            </Text>
            <Text fontSize="caption" color="neutral-textLow">
              URL de redirect: <strong>{callbackUrl}</strong>
            </Text>
            <Text fontSize="caption" color="neutral-textLow">
              URL de autorizacion: <strong>{oauthUrl}</strong>
            </Text>
            <Text fontSize="caption" color="neutral-textLow">
              Si el boton te manda al dashboard: Apps → TN Posta → Desinstalar,
              luego volve a usar Autorizar.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default OAuthInstallScreen;
