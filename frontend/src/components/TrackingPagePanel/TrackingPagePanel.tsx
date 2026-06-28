import { Box, Button, Input, Label, Text, Toggle } from "@nimbus-ds/components";

type TrackingPagePanelProps = {
  enabled: boolean;
  title: string;
  pagePublicUrl?: string | null;
  syncMessage?: string | null;
  disabled?: boolean;
  saving?: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onTitleChange: (title: string) => void;
  onSave: () => void;
};

const TrackingPagePanel = ({
  enabled,
  title,
  pagePublicUrl,
  syncMessage,
  disabled = false,
  saving = false,
  onEnabledChange,
  onTitleChange,
  onSave,
}: TrackingPagePanelProps) => {
  const copyUrl = async () => {
    if (!pagePublicUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(pagePublicUrl);
    } catch {
      window.prompt("Copia esta URL:", pagePublicUrl);
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
            Al guardar, creamos o actualizamos la pagina en tu tienda de
            Tiendanube automaticamente.
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

      {syncMessage && (
        <Box
          padding="3"
          backgroundColor="neutral-surface"
          borderRadius="2"
        >
          <Text fontSize="caption">{syncMessage}</Text>
        </Box>
      )}

      {enabled && pagePublicUrl && (
        <Box
          padding="3"
          backgroundColor="neutral-surface"
          borderRadius="2"
          display="flex"
          flexDirection="column"
          gap="2"
        >
          <Text fontWeight="medium">Pagina en tu tienda</Text>
          <Text fontSize="caption" color="neutral-textLow">
            Si aun no aparece en el menu, agrega un enlace en Navegacion apuntando
            a esta URL (solo la primera vez).
          </Text>
          <Text fontSize="caption">{pagePublicUrl}</Text>
          <Box display="flex" flexWrap="wrap" gap="2">
            <Button appearance="neutral" onClick={copyUrl}>
              Copiar URL de la tienda
            </Button>
            <Button
              as="a"
              appearance="neutral"
              href={pagePublicUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ver en la tienda
            </Button>
          </Box>
        </Box>
      )}

      {!enabled && (
        <Text fontSize="caption" color="neutral-textLow">
          Al desactivar, la pagina de la tienda mostrara un aviso de consulta no
          disponible.
        </Text>
      )}

      <Button appearance="primary" disabled={disabled || saving} onClick={onSave}>
        {saving ? "Publicando..." : "Guardar y publicar en Tiendanube"}
      </Button>
    </Box>
  );
};

export default TrackingPagePanel;
