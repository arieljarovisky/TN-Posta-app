import { Alert, Box, Text } from "@nimbus-ds/components";

type ShippingPublishAlertProps = {
  carrierId?: number | null;
  carrierName?: string;
  connected: boolean;
  enabled: boolean;
  syncMessage?: string | null;
};

const ShippingPublishAlert = ({
  carrierId,
  carrierName = "TN Posta",
  connected,
  enabled,
  syncMessage,
}: ShippingPublishAlertProps) => {
  if (!connected) {
    return null;
  }

  const published = Boolean(carrierId);

  return (
    <Box display="flex" flexDirection="column" gap="2">
      <Alert
        appearance={published && enabled ? "success" : "warning"}
        title={
          published
            ? `${carrierName} publicado en Tiendanube`
            : "Aun no aparece en Envios de la tienda"
        }
      >
        {published ? (
          <Box display="flex" flexDirection="column" gap="2">
            <Text fontSize="caption">
              El carrier quedo creado (ID {carrierId}). En el admin de
              Tiendanube buscalo en{" "}
              <strong>Configuracion → Envios y zonas</strong>, en la seccion de{" "}
              <strong>aplicaciones / medios de envio</strong>, no en "Envio
              personalizado".
            </Text>
            <Text fontSize="caption" color="neutral-textLow">
              En el checkout solo se muestra la tarifa que corresponde a la
              zona del CP (ej. CABA $4500). Las otras tarifas aparecen cuando el
              cliente pone un CP de GBA.
            </Text>
            <Text fontSize="caption" color="neutral-textLow">
              Si ves "ENVIO EXPRESS" en el checkout pero no {carrierName}, puede
              ser un envio manual viejo. Desactiva el "Envio personalizado"
              anterior para evitar duplicados.
            </Text>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap="2">
            <Text fontSize="caption">
              Las tarifas estan guardadas en la app pero{" "}
              <strong>no se publicaron</strong> en Tiendanube. Hace falta el
              permiso <strong>Edit Shipping</strong> (Editar envios) en el
              Partner Portal, <strong>APP_PUBLIC_URL</strong> en Railway, y
              volver a guardar las tarifas tras reconectar la tienda.
            </Text>
            {syncMessage && (
              <Text fontSize="caption" color="neutral-textLow">
                {syncMessage}
              </Text>
            )}
          </Box>
        )}
      </Alert>
    </Box>
  );
};

export default ShippingPublishAlert;
