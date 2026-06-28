import { Box, Button, Input, Label, Text, Toggle } from "@nimbus-ds/components";

type TrackingPagePanelProps = {
  enabled: boolean;
  title: string;
  pageUrl?: string;
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
  storePublicUrl,
  disabled = false,
  saving = false,
  onEnabledChange,
  onTitleChange,
  onSave,
}: TrackingPagePanelProps) => {
  const copyUrl = async () => {
    if (!pageUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      window.prompt("Copia esta URL:", pageUrl);
    }
  };

  const embedCode = pageUrl
    ? `<iframe src="${pageUrl}" title="Seguimiento de envio" width="100%" height="720" style="border:0;border-radius:12px;" loading="lazy"></iframe>`
    : "";

  const copyEmbed = async () => {
    if (!embedCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(embedCode);
    } catch {
      window.prompt("Copia este codigo:", embedCode);
    }
  };

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
          gap="2"
        >
          <Text fontWeight="medium">URL para tu tienda</Text>
          <Text fontSize="caption" color="neutral-textLow">
            En Tiendanube: Paginas → Nueva pagina, o agrega un enlace en el menu
            apuntando a esta URL.
          </Text>
          <Text fontSize="caption">{pageUrl}</Text>
          <Box display="flex" flexWrap="wrap" gap="2">
            <Button appearance="neutral" disabled={!enabled} onClick={copyUrl}>
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
            <Button appearance="neutral" disabled={!enabled} onClick={copyEmbed}>
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
