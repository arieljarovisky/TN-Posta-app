import { BadRequestException } from "@utils";
import {
  CABA_PROVINCE_ALIASES,
  GBA_LOCALITIES,
  GBA_PROVINCE_ALIASES,
} from "./caba-gba.constants";

export type DeliveryZone = "CABA" | "GBA";

export interface ShippingAddressInput {
  city: string;
  province: string;
  zipcode: string;
  locality?: string;
}

export interface ZoneValidationResult {
  eligible: boolean;
  zone?: DeliveryZone;
  reason?: string;
}

const normalize = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const parsePostalNumber = (zipcode: string): number | null => {
  const digits = zipcode.replace(/\D/g, "");
  if (!digits) {
    return null;
  }

  return Number.parseInt(digits, 10);
};

const isCabaPostalCode = (zipcode: string): boolean => {
  const postalNumber = parsePostalNumber(zipcode);
  return postalNumber !== null && postalNumber >= 1000 && postalNumber <= 1599;
};

const isGbaPostalCode = (zipcode: string): boolean => {
  const cleaned = zipcode.trim().toUpperCase();

  if (cleaned.startsWith("B")) {
    const postalNumber = parsePostalNumber(cleaned.slice(1));
    return postalNumber !== null && postalNumber >= 1600 && postalNumber <= 1999;
  }

  const postalNumber = parsePostalNumber(zipcode);
  return postalNumber !== null && postalNumber >= 1600 && postalNumber <= 1999;
};

const matchesLocality = (city: string, locality?: string): boolean => {
  const values = [city, locality].filter(Boolean).map((value) => normalize(value!));

  return values.some((value) =>
    GBA_LOCALITIES.some(
      (localityName) =>
        value === localityName ||
        value.includes(localityName) ||
        localityName.includes(value)
    )
  );
};

export const validateDeliveryZone = (
  address: ShippingAddressInput
): ZoneValidationResult => {
  const province = normalize(address.province);
  const city = normalize(address.city);

  if (CABA_PROVINCE_ALIASES.includes(province) || isCabaPostalCode(address.zipcode)) {
    return { eligible: true, zone: "CABA" };
  }

  if (
    GBA_PROVINCE_ALIASES.includes(province) &&
    (matchesLocality(address.city, address.locality) || isGbaPostalCode(address.zipcode))
  ) {
    return { eligible: true, zone: "GBA" };
  }

  if (city.includes("capital federal") || city === "caba") {
    return { eligible: true, zone: "CABA" };
  }

  return {
    eligible: false,
    reason:
      "Solo se permiten envios personalizados para Capital Federal y Gran Buenos Aires.",
  };
};

export const assertEligibleZone = (address: ShippingAddressInput): DeliveryZone => {
  const validation = validateDeliveryZone(address);

  if (!validation.eligible || !validation.zone) {
    throw new BadRequestException(
      "Zona no habilitada",
      validation.reason ??
        "La direccion del pedido no corresponde a CABA o Gran Buenos Aires."
    );
  }

  return validation.zone;
};
