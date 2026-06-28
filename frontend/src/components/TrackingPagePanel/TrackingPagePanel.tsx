import { Box, Button, Input, Label, Text, Toggle } from "@nimbus-ds/components";

type TrackingPagePanelProps = {
  enabled: boolean;
  title: string;
  pageUrl?: string;
  embedHtml?: string;
  storePublicUrl?: string | null;
  disabled?: boolean;
  saving?: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onTitleChange: (title: string) => void;
  onSave: () => void;
};

const TrackingPagePanel = ({
  enabled,
  title,
  pageUrl = "",
  embedHtml = "",
  storePublicUrl,
  disabled = false,
  saving = false,
  onEnabledChange,
  onTitleChange,
  onSave,
}: TrackingPagePanelProps) => {
  const copyText = async (value: string, promptLabel: string) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      window.prompt(promptLabel, value);
    }
  };

  const iframeCode = pageUrl
    ? `<iframe src="${pageUrl}?embed=1" title="Consulta de envio" width="100%" height="480" style="border:0;border-radius:12px;background:#fff;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
    : "";

  return (
    <Box display="flex" flexDirection="column" gap="4">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="4"
      >
        <Box display="flex" flexDirection="column" gap="1">
          <Text fontWeight="medium">Activar pagina de seguimiento</Text>
          <Text fontSize="caption" color="neutral-textLow">
            Tus clientes podran consultar el estado del envio con su codigo TPA.
          </Text>
        </Box>
        <Toggle
          name="tracking-page-enabled"
          active={enabled}
          disabled={disabled || saving}
          onChange={() => onEnabledChange(!enabled)}
        />
      </Box>

      <Box display="flex" flexDirection="column" gap="1">
        <Label htmlFor="tracking-page-title">Titulo de la pagina</Label>
        <Input
          id="tracking-page-title"
          name="tracking-page-title"
          value={title}
          disabled={disabled || saving}
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </Box>

      {pageUrl && (
        <Box
          padding="3"
          backgroundColor="neutral-surface"
          borderRadius="2"
          display="flex"
          flexDirection="column"
          gap="3"
        >
          <Box display="flex" flexDirection="column" gap="2">
            <Text fontWeight="medium">Codigo para Tiendanube (recomendado)</Text>
            <Text fontSize="caption" color="neutral-textLow">
              Tiendanube bloquea iframes externos: el recuadro queda en blanco. En
              su lugar, pega este codigo en Paginas → Seguimiento de envios →
              editor HTML.
            </Text>
            {embedHtml && (
              <Box
                as="pre"
                padding="3"
                backgroundColor="neutral-background"
                borderRadius="2"
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  margin: 0,
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              >
                {embedHtml}
              </Box>
            )}
            <Box display="flex" flexWrap="wrap" gap="2">
              <Button
                appearance="primary"
                disabled={!enabled || !embedHtml}
                onClick={() =>
                  copyText(embedHtml, "Copia este codigo para Tiendanube:")
                }
              >
                Copiar codigo HTML
              </Button>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap="2">
            <Text fontWeight="medium">Enlace en el menu</Text>
            <Text fontSize="caption" color="neutral-textLow">
              Alternativa: agrega un enlace en el menu apuntando a esta URL (abre la
              consulta en una pagina completa).
            </Text>
            <Text fontSize="caption">{pageUrl}</Text>
            <Box display="flex" flexWrap="wrap" gap="2">
              <Button
                appearance="neutral"
                disabled={!enabled}
                onClick={() => copyText(pageUrl, "Copia esta URL:")}
              >
                Copiar URL
              </Button>
              <Button
                as="a"
                appearance="neutral"
                href={pageUrl}
                target="_blank"
                rel="noreferrer"
              >
                Ver pagina
              </Button>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap="2">
            <Text fontWeight="medium">Iframe (no funciona en Tiendanube)</Text>
            <Text fontSize="caption" color="neutral-textLow">
              Solo util si tu sitio permite embeber paginas externas.
            </Text>
            <Button
              appearance="neutral"
              disabled={!enabled || !iframeCode}
              onClick={() => copyText(iframeCode, "Copia este iframe:")}
            >
              Copiar iframe
            </Button>
          </Box>

          {storePublicUrl && (
            <Text fontSize="caption" color="neutral-textLow">
              Tienda: {storePublicUrl}
            </Text>
          )}
        </Box>
      )}

      {!enabled && (
        <Text fontSize="caption" color="neutral-textLow">
          Mientras este desactivada, los clientes veran un aviso si consultan un
          codigo.
        </Text>
      )}

      <Button appearance="primary" disabled={disabled || saving} onClick={onSave}>
        {saving ? "Guardando..." : "Guardar pagina de seguimiento"}
      </Button>
    </Box>
  );
};

export default TrackingPagePanel;
