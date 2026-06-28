import { FormEvent, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Input,
  Spinner,
  Tag,
  Text,
} from "@nimbus-ds/components";
import { PlusCircleIcon, TrashIcon } from "@nimbus-ds/icons";

import { ZoneCoverageInfo } from "@/services/zones.api";
import { ShippingRateZone, ZoneLocalitiesMap } from "@/types/shipping";

const normalizeLocality = (value: string): string => value.trim();

type ZoneLocalitiesPreviewProps = {
  zone: ShippingRateZone;
  coverage?: ZoneCoverageInfo;
  loading?: boolean;
};

export const ZoneLocalitiesPreview = ({
  coverage,
  loading = false,
}: ZoneLocalitiesPreviewProps) => {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap="2">
        <Spinner size="small" />
        <Text fontSize="caption" color="neutral-textLow">
          Cargando barrios...
        </Text>
      </Box>
    );
  }

  if (!coverage) {
    return null;
  }

  const preview = coverage.localities.slice(0, 6);
  const remaining = coverage.localities.length - preview.length;

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="2"
      padding="2"
      backgroundColor="neutral-surface"
      borderRadius="2"
    >
      <Text fontSize="caption" color="neutral-textLow">
        {coverage.description}
        {coverage.postal_codes ? ` · ${coverage.postal_codes}` : ""}
      </Text>

      <Box display="flex" flexWrap="wrap" gap="1">
        {(expanded ? coverage.localities : preview).map((locality) => (
          <Tag key={locality} appearance="neutral">
            {locality}
          </Tag>
        ))}
      </Box>

      {coverage.localities.length > preview.length && (
        <Box>
          <Button
            appearance="transparent"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded
              ? "Ver menos barrios"
              : `Ver todos los barrios (${coverage.localities.length})`}
            {!expanded && remaining > 0 ? ` · +${remaining} mas` : ""}
          </Button>
        </Box>
      )}
    </Box>
  );
};

type EditableZoneLocalitiesProps = {
  zone: ShippingRateZone;
  localities: string[];
  disabled?: boolean;
  onChange: (zone: ShippingRateZone, localities: string[]) => void;
};

const EditableZoneLocalities = ({
  zone,
  localities,
  disabled = false,
  onChange,
}: EditableZoneLocalitiesProps) => {
  const [newLocality, setNewLocality] = useState("");

  const addLocality = () => {
    const value = normalizeLocality(newLocality);

    if (!value) {
      return;
    }

    const exists = localities.some(
      (item) => item.toLowerCase() === value.toLowerCase()
    );

    if (exists) {
      setNewLocality("");
      return;
    }

    onChange(zone, [...localities, value].sort((a, b) => a.localeCompare(b, "es")));
    setNewLocality("");
  };

  const removeLocality = (locality: string) => {
    onChange(
      zone,
      localities.filter((item) => item !== locality)
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    addLocality();
  };

  return (
    <Box display="flex" flexDirection="column" gap="2">
      <Box display="flex" flexWrap="wrap" gap="1">
        {localities.map((locality) => (
          <Box
            key={`${zone}-${locality}`}
            display="inline-flex"
            alignItems="center"
            gap="1"
          >
            <Tag appearance="neutral">{locality}</Tag>
            <IconButton
              size="2rem"
              source={<TrashIcon />}
              disabled={disabled}
              aria-label={`Quitar ${locality}`}
              onClick={() => removeLocality(locality)}
            />
          </Box>
        ))}
        {localities.length === 0 && (
          <Text fontSize="caption" color="neutral-textLow">
            No hay barrios en esta zona. Agrega al menos uno.
          </Text>
        )}
      </Box>

      <Box
        as="form"
        display="flex"
        flexWrap="wrap"
        gap="2"
        alignItems="flex-end"
        onSubmit={handleSubmit}
      >
        <Box display="flex" flexDirection="column" gap="1" flex="1" minWidth="200px">
          <Input
            id={`locality-${zone}`}
            name={`locality-${zone}`}
            value={newLocality}
            disabled={disabled}
            placeholder="Nombre del barrio o partido"
            onChange={(event) => setNewLocality(event.target.value)}
          />
        </Box>
        <Button
          type="submit"
          appearance="neutral"
          disabled={disabled || !normalizeLocality(newLocality)}
        >
          <PlusCircleIcon size="small" />
          Agregar
        </Button>
      </Box>
    </Box>
  );
};

type ZoneCoveragePanelProps = {
  zones: ZoneCoverageInfo[];
  loading?: boolean;
  error?: string | null;
  highlightZones?: ShippingRateZone[];
  editable?: boolean;
  disabled?: boolean;
  saving?: boolean;
  zoneLocalities?: ZoneLocalitiesMap;
  onLocalitiesChange?: (localities: ZoneLocalitiesMap) => void;
  onSave?: () => void;
};

const ZoneCoveragePanel = ({
  zones,
  loading = false,
  error = null,
  highlightZones = [],
  editable = false,
  disabled = false,
  saving = false,
  zoneLocalities = {},
  onLocalitiesChange,
  onSave,
}: ZoneCoveragePanelProps) => {
  const [expandedZone, setExpandedZone] = useState<ShippingRateZone | null>(
    highlightZones[0] ?? null
  );

  const getLocalitiesForZone = (zone: ShippingRateZone): string[] =>
    zoneLocalities[zone] ??
    zones.find((entry) => entry.zone === zone)?.localities ??
    [];

  const handleZoneLocalitiesChange = (
    zone: ShippingRateZone,
    localities: string[]
  ) => {
    onLocalitiesChange?.({
      ...zoneLocalities,
      [zone]: localities,
    });
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap="2">
        <Spinner size="small" />
        <Text>Cargando cobertura por barrio...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Text fontSize="caption" color="danger-text">
        {error}
      </Text>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap="3">
      <Text fontSize="caption" color="neutral-textLow">
        {editable
          ? "Agrega o quita barrios y partidos incluidos en cada zona de envio."
          : "Referencia de barrios y partidos incluidos en cada zona de envio."}
      </Text>

      {zones.map((zone) => {
        const isExpanded = expandedZone === zone.zone;
        const isHighlighted = highlightZones.includes(zone.zone);
        const localities = getLocalitiesForZone(zone.zone);

        return (
          <Box
            key={zone.zone}
            display="flex"
            flexDirection="column"
            gap="2"
            padding="3"
            borderWidth="1"
            borderStyle="solid"
            borderColor={
              isHighlighted ? "primary-interactive" : "neutral-surfaceHighlight"
            }
            borderRadius="2"
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap="2"
            >
              <Box display="flex" flexDirection="column" gap="1">
                <Text fontWeight="medium">{zone.label}</Text>
                <Text fontSize="caption" color="neutral-textLow">
                  {localities.length} barrios/localidades
                  {zone.postal_codes ? ` · ${zone.postal_codes}` : ""}
                </Text>
              </Box>
              <Button
                appearance="neutral"
                onClick={() =>
                  setExpandedZone(isExpanded ? null : zone.zone)
                }
              >
                {isExpanded ? "Ocultar" : "Editar barrios"}
              </Button>
            </Box>

            {isExpanded && (
              <Box display="flex" flexDirection="column" gap="2">
                <Text fontSize="caption" color="neutral-textLow">
                  {zone.description}
                </Text>
                {editable ? (
                  <EditableZoneLocalities
                    zone={zone.zone}
                    localities={localities}
                    disabled={disabled || saving}
                    onChange={handleZoneLocalitiesChange}
                  />
                ) : (
                  <Box display="flex" flexWrap="wrap" gap="1">
                    {localities.map((locality) => (
                      <Tag key={`${zone.zone}-${locality}`} appearance="neutral">
                        {locality}
                      </Tag>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        );
      })}

      {editable && onSave && (
        <Box>
          <Button appearance="primary" disabled={disabled || saving} onClick={onSave}>
            {saving ? "Guardando..." : "Guardar cobertura"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ZoneCoveragePanel;
