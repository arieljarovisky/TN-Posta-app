import { GBA_EXTENDED_LOCALITIES, GBA_LOCALITIES, GBA_NEAR_LOCALITIES } from "./caba-gba.constants";
import { ShippingRateZone } from "@features/shipping/interfaces/shipping.interfaces";

export interface ZoneCoverageInfo {
  zone: ShippingRateZone;
  label: string;
  description: string;
  postal_codes?: string;
  localities: string[];
}

export type ZoneLocalitiesMap = Partial<Record<ShippingRateZone, string[]>>;

const normalize = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const CANONICAL_NAMES: Record<string, string> = {
  avellaneda: "Avellaneda",
  lanus: "Lanús",
  "lomas de zamora": "Lomas de Zamora",
  quilmes: "Quilmes",
  berazategui: "Berazategui",
  "florencio varela": "Florencio Varela",
  "almirante brown": "Almirante Brown",
  moron: "Morón",
  "san isidro": "San Isidro",
  "vicente lopez": "Vicente López",
  tigre: "Tigre",
  "san fernando": "San Fernando",
  "san miguel": "San Miguel",
  "malvinas argentinas": "Malvinas Argentinas",
  "jose c. paz": "José C. Paz",
  "tres de febrero": "Tres de Febrero",
  hurlingham: "Hurlingham",
  ituzaingo: "Ituzaingó",
  "la matanza": "La Matanza",
  "esteban echeverria": "Esteban Echeverría",
  ezeiza: "Ezeiza",
  merlo: "Merlo",
  moreno: "Moreno",
  pilar: "Pilar",
  escobar: "Escobar",
  "san martin": "San Martín",
  "general san martin": "General San Martín",
  "general rodriguez": "General Rodríguez",
  "la plata": "La Plata",
  "marcos paz": "Marcos Paz",
  "presidente peron": "Presidente Perón",
};

const toDisplayName = (value: string): string => {
  const normalized = normalize(value);

  return CANONICAL_NAMES[normalized] ?? value;
};

const dedupeLocalities = (values: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const displayName = toDisplayName(value);
    const key = normalize(displayName);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(displayName);
  }

  return result.sort((a, b) => a.localeCompare(b, "es"));
};

export const normalizeLocalityName = (value: string): string =>
  toDisplayName(value.trim());

export const normalizeZoneLocalitiesMap = (
  input?: ZoneLocalitiesMap
): ZoneLocalitiesMap => {
  if (!input) {
    return {};
  }

  const zones: ShippingRateZone[] = [
    "caba",
    "gba_near",
    "gba_extended",
    "gba_all",
  ];

  const result: ZoneLocalitiesMap = {};

  for (const zone of zones) {
    const values = input[zone];

    if (!values?.length) {
      continue;
    }

    const normalized = dedupeLocalities(
      values.map((value) => String(value).trim()).filter(Boolean)
    );

    if (normalized.length > 0) {
      result[zone] = normalized;
    }
  }

  return result;
};

export const CABA_BARRIOS = dedupeLocalities([
  "Agronomía",
  "Almagro",
  "Balvanera",
  "Barracas",
  "Belgrano",
  "Boedo",
  "Caballito",
  "Chacarita",
  "Coghlan",
  "Colegiales",
  "Constitución",
  "Flores",
  "Floresta",
  "La Boca",
  "La Paternal",
  "Liniers",
  "Mataderos",
  "Monte Castro",
  "Montserrat",
  "Núñez",
  "Palermo",
  "Parque Avellaneda",
  "Parque Chacabuco",
  "Parque Chas",
  "Parque Patricios",
  "Puerto Madero",
  "Recoleta",
  "Retiro",
  "Saavedra",
  "San Cristóbal",
  "San Nicolás",
  "San Telmo",
  "Velez Sarsfield",
  "Versalles",
  "Villa Crespo",
  "Villa del Parque",
  "Villa Devoto",
  "Villa General Mitre",
  "Villa Lugano",
  "Villa Luro",
  "Villa Ortúzar",
  "Villa Pueyrredón",
  "Villa Real",
  "Villa Riachuelo",
  "Villa Santa Rita",
  "Villa Soldati",
  "Villa Urquiza",
]);

const buildGbaAllLocalities = (): string[] =>
  dedupeLocalities([...GBA_LOCALITIES, ...GBA_NEAR_LOCALITIES, ...GBA_EXTENDED_LOCALITIES]);

export const DEFAULT_ZONE_LOCALITIES: Record<ShippingRateZone, string[]> = {
  caba: CABA_BARRIOS,
  gba_near: dedupeLocalities(GBA_NEAR_LOCALITIES),
  gba_extended: dedupeLocalities(GBA_EXTENDED_LOCALITIES),
  gba_all: buildGbaAllLocalities(),
};

export const resolveZoneLocalities = (
  zone: ShippingRateZone,
  overrides?: ZoneLocalitiesMap
): string[] => {
  const custom = overrides?.[zone];

  if (custom?.length) {
    return dedupeLocalities(custom);
  }

  return DEFAULT_ZONE_LOCALITIES[zone];
};

export const ZONE_COVERAGE: ZoneCoverageInfo[] = [
  {
    zone: "caba",
    label: "Capital Federal (CABA)",
    description: "Todos los barrios de la Ciudad Autónoma de Buenos Aires.",
    postal_codes: "CP 1000 - 1599",
    localities: DEFAULT_ZONE_LOCALITIES.caba,
  },
  {
    zone: "gba_near",
    label: "GBA - zonas cercanas",
    description: "Partidos del conurbano sur y cercano.",
    postal_codes: "CP 1600 - 1999 (segun localidad)",
    localities: DEFAULT_ZONE_LOCALITIES.gba_near,
  },
  {
    zone: "gba_extended",
    label: "GBA - zonas extendidas",
    description: "Partidos del conurbano norte y oeste medio.",
    postal_codes: "CP 1600 - 1999 (segun localidad)",
    localities: DEFAULT_ZONE_LOCALITIES.gba_extended,
  },
  {
    zone: "gba_all",
    label: "Gran Buenos Aires (todo GBA)",
    description: "Todos los partidos configurados en TN Posta dentro de Provincia de Buenos Aires.",
    postal_codes: "CP 1600 - 1999",
    localities: DEFAULT_ZONE_LOCALITIES.gba_all,
  },
];

export const getZoneCoverage = (
  zone: ShippingRateZone,
  overrides?: ZoneLocalitiesMap
): ZoneCoverageInfo => {
  const base = ZONE_COVERAGE.find((entry) => entry.zone === zone) ?? ZONE_COVERAGE[0];

  return {
    ...base,
    localities: resolveZoneLocalities(zone, overrides),
  };
};

export const getAllZoneCoverage = (
  overrides?: ZoneLocalitiesMap
): ZoneCoverageInfo[] =>
  ZONE_COVERAGE.map((entry) => ({
    ...entry,
    localities: resolveZoneLocalities(entry.zone, overrides),
  }));
