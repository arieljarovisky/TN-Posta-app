export type ShippingRateZone =
  | "caba"
  | "gba_near"
  | "gba_extended"
  | "gba_all";

export type ZoneLocalitiesMap = Partial<Record<ShippingRateZone, string[]>>;

export interface ShippingRateRule {
  id: string;
  code: string;
  name: string;
  zone: ShippingRateZone;
  price: number;
  active: boolean;
}

export const SHIPPING_ZONE_OPTIONS: Array<{
  value: ShippingRateZone;
  label: string;
}> = [
  { value: "caba", label: "Capital Federal (CABA)" },
  { value: "gba_near", label: "GBA - zonas cercanas" },
  { value: "gba_extended", label: "GBA - zonas extendidas" },
  { value: "gba_all", label: "Gran Buenos Aires (todo GBA)" },
];

export const createEmptyShippingRate = (): ShippingRateRule => ({
  id: crypto.randomUUID(),
  code: "",
  name: "",
  zone: "caba",
  price: 0,
  active: true,
});
