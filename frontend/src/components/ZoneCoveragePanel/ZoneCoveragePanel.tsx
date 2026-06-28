import { useState } from "react";
import { Box, Button, Spinner, Tag, Text } from "@nimbus-ds/components";

import { ZoneCoverageInfo } from "@/services/zones.api";
import { ShippingRateZone } from "@/types/shipping";

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

type ZoneCoveragePanelProps = {
  zones: ZoneCoverageInfo[];
  loading?: boolean;
  error?: string | null;
  highlightZones?: ShippingRateZone[];
};

const ZoneCoveragePanel = ({
  zones,
  loading = false,
  error = null,
  highlightZones = [],
}: ZoneCoveragePanelProps) => {
  const [expandedZone, setExpandedZone] = useState<ShippingRateZone | null>(
    highlightZones[0] ?? null
  );

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
        Referencia de barrios y partidos incluidos en cada zona de envio.
      </Text>

      {zones.map((zone) => {
        const isExpanded = expandedZone === zone.zone;
        const isHighlighted = highlightZones.includes(zone.zone);

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
                  {zone.localities.length} barrios/localidades
                  {zone.postal_codes ? ` · ${zone.postal_codes}` : ""}
                </Text>
              </Box>
              <Button
                appearance="neutral"
                onClick={() =>
                  setExpandedZone(isExpanded ? null : zone.zone)
                }
              >
                {isExpanded ? "Ocultar" : "Ver barrios"}
              </Button>
            </Box>

            {isExpanded && (
              <Box display="flex" flexDirection="column" gap="2">
                <Text fontSize="caption" color="neutral-textLow">
                  {zone.description}
                </Text>
                <Box display="flex" flexWrap="wrap" gap="1">
                  {zone.localities.map((locality) => (
                    <Tag key={`${zone.zone}-${locality}`} appearance="neutral">
                      {locality}
                    </Tag>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default ZoneCoveragePanel;
