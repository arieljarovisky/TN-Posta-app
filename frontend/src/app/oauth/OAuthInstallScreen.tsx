import { Alert, Box, Button, Text, Title } from "@nimbus-ds/components";

import {
  getOAuthInstallUrl,
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
  const oauthUrl = getOAuthInstallUrl();

  const titles: Record<OAuthInstallScreenProps["variant"], string> = {
    missing_code: "Falta autorizacion de Tiendanube",
    error: "Error al conectar la tienda",
    success: "Tienda conectada correctamente",
    standalone: "TN Posta",
  };

  const descriptions: Record<OAuthInstallScreenProps["variant"], string> = {
    missing_code:
      "Tiendanube no envio el codigo de autorizacion. Suele pasar si la URL de redirect en el Partner Portal no coincide con /auth/install, o si abriste el enlace sin completar OAuth.",
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
              Te llevara a Tiendanube para aceptar permisos. Al terminar volveras
              aca automaticamente.
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
              : "Ir al administrador de mi tienda"}
          </Button>
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
              Verifica en el Partner Portal de Tiendanube:
            </Text>
            <Text fontSize="caption" color="neutral-textLow">
              URL de redirect:{" "}
              <strong>{window.location.origin}/auth/install</strong>
            </Text>
            <Text fontSize="caption" color="neutral-textLow">
              URL de autorizacion: <strong>{oauthUrl}</strong>
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default OAuthInstallScreen;
