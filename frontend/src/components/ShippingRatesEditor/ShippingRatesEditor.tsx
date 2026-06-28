import { CSSProperties } from "react";
import {
  Box,
  Button,
  Input,
  Label,
  Text,
  Toggle,
} from "@nimbus-ds/components";
import { PlusCircleIcon, TrashIcon } from "@nimbus-ds/icons";

import {
  createEmptyShippingRate,
  SHIPPING_ZONE_OPTIONS,
  ShippingRateRule,
  ShippingRateZone,
} from "@/types/shipping";
import { ZoneCoverageInfo } from "@/services/zones.api";
import { ZoneLocalitiesPreview } from "@/components/ZoneCoveragePanel/ZoneCoveragePanel";

type ShippingRatesEditorProps = {
  carrierName: string;
  rates: ShippingRateRule[];
  disabled?: boolean;
  zoneCoverage?: ZoneCoverageInfo[];
  zoneCoverageLoading?: boolean;
  onCarrierNameChange: (value: string) => void;
  onRatesChange: (rates: ShippingRateRule[]) => void;
  onSave: () => void;
};

const selectStyle: CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid var(--nimbus-colors-neutral-surfaceHighlight, #d4d4d4)",
  fontSize: "14px",
  background: "var(--nimbus-colors-neutral-background, #fff)",
};

const ShippingRatesEditor = ({
  carrierName,
  rates,
  disabled = false,
  zoneCoverage = [],
  zoneCoverageLoading = false,
  onCarrierNameChange,
  onRatesChange,
  onSave,
}: ShippingRatesEditorProps) => {
  const getCoverageForZone = (zone: ShippingRateZone) =>
    zoneCoverage.find((entry) => entry.zone === zone);
  const updateRate = (id: string, patch: Partial<ShippingRateRule>) => {
    onRatesChange(
      rates.map((rate) => (rate.id === id ? { ...rate, ...patch } : rate))
    );
  };

  const removeRate = (id: string) => {
    onRatesChange(rates.filter((rate) => rate.id !== id));
  };

  const addRate = () => {
    onRatesChange([...rates, createEmptyShippingRate()]);
  };

  return (
    <Box display="flex" flexDirection="column" gap="4">
      <Box display="flex" flexDirection="column" gap="2">
        <Label htmlFor="carrier-name">Nombre del metodo de envio en checkout</Label>
        <Input
          id="carrier-name"
          name="carrier-name"
          value={carrierName}
          disabled={disabled}
          placeholder="TN Posta"
          onChange={(event) => onCarrierNameChange(event.target.value)}
        />
        <Text fontSize="caption" color="neutral-textLow">
          Es el nombre de la empresa de envio que vera el cliente en Tiendanube.
        </Text>
      </Box>

      <Box display="flex" flexDirection="column" gap="3">
        <Text fontWeight="medium">Tarifas por zona</Text>

        {rates.length === 0 ? (
          <Text fontSize="caption" color="neutral-textLow">
            Agrega al menos una tarifa para publicar envios en el checkout.
          </Text>
        ) : (
          rates.map((rate, index) => (
            <Box
              key={rate.id}
              display="flex"
              flexDirection="column"
              gap="3"
              padding="3"
              borderWidth="1"
              borderStyle="solid"
              borderColor="neutral-surfaceHighlight"
              borderRadius="2"
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap="2"
              >
                <Text fontWeight="medium">Tarifa {index + 1}</Text>
                <Box display="flex" alignItems="center" gap="2">
                  <Toggle
                    name={`rate-active-${rate.id}`}
                    active={rate.active}
                    disabled={disabled}
                    onChange={() => updateRate(rate.id, { active: !rate.active })}
                  />
                  <Button
                    appearance="neutral"
                    disabled={disabled}
                    onClick={() => removeRate(rate.id)}
                  >
                    <TrashIcon size="small" />
                  </Button>
                </Box>
              </Box>

              <Box display="flex" flexDirection="column" gap="2">
                <Label htmlFor={`rate-name-${rate.id}`}>Nombre visible</Label>
                <Input
                  id={`rate-name-${rate.id}`}
                  value={rate.name}
                  disabled={disabled}
                  placeholder="ENVIO EXPRESS - CABA"
                  onChange={(event) =>
                    updateRate(rate.id, { name: event.target.value })
                  }
                />
              </Box>

              <Box display="grid" gap="3" style={{ gridTemplateColumns: "1fr 140px" }}>
                <Box display="flex" flexDirection="column" gap="2">
                  <Label htmlFor={`rate-zone-${rate.id}`}>Zona de cobertura</Label>
                  <select
                    id={`rate-zone-${rate.id}`}
                    value={rate.zone}
                    disabled={disabled}
                    style={selectStyle}
                    onChange={(event) =>
                      updateRate(rate.id, {
                        zone: event.target.value as ShippingRateZone,
                      })
                    }
                  >
                    {SHIPPING_ZONE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Box>

                <Box display="flex" flexDirection="column" gap="2">
                  <Label htmlFor={`rate-price-${rate.id}`}>Precio (ARS)</Label>
                  <Input
                    id={`rate-price-${rate.id}`}
                    type="number"
                    min={0}
                    step={100}
                    value={String(rate.price)}
                    disabled={disabled}
                    onChange={(event) =>
                      updateRate(rate.id, {
                        price: Number(event.target.value) || 0,
                      })
                    }
                  />
                </Box>
              </Box>

              <ZoneLocalitiesPreview
                zone={rate.zone}
                coverage={getCoverageForZone(rate.zone)}
                loading={zoneCoverageLoading}
              />
            </Box>
          ))
        )}
      </Box>

      <Box display="flex" flexWrap="wrap" gap="2">
        <Button appearance="neutral" disabled={disabled} onClick={addRate}>
          <PlusCircleIcon size="small" />
          Agregar tarifa
        </Button>
        <Button appearance="primary" disabled={disabled} onClick={onSave}>
          Guardar tarifas de envio
        </Button>
      </Box>
    </Box>
  );
};

export default ShippingRatesEditor;
