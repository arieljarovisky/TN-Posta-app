import {
  GBA_EXTENDED_LOCALITIES,
  GBA_NEAR_LOCALITIES,
} from "./caba-gba.constants";
import { ShippingAddressInput } from "./zone-validator";

import type { ShippingRateZone } from "@features/shipping/interfaces/shipping.interfaces";

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

const matchesLocalityList = (
  city: string,
  locality: string | undefined,
  localities: string[]
): boolean => {
  const values = [city, locality].filter(Boolean).map((value) => normalize(value!));

  return values.some((value) =>
    localities.some(
      (localityName) =>
        value === localityName ||
        value.includes(localityName) ||
        localityName.includes(value)
    )
  );
};

export const isCabaAddress = (address: ShippingAddressInput): boolean => {
  const province = normalize(address.province);
  const city = normalize(address.city);

  return (
    province.includes("capital federal") ||
    province === "caba" ||
    city.includes("capital federal") ||
    city === "caba" ||
    isCabaPostalCode(address.zipcode)
  );
};

export const isGbaAddress = (address: ShippingAddressInput): boolean => {
  if (isCabaAddress(address)) {
    return false;
  }

  const province = normalize(address.province);

  return (
    province.includes("buenos aires") ||
    province === "gba" ||
    matchesLocalityList(address.city, address.locality, [
      ...GBA_NEAR_LOCALITIES,
      ...GBA_EXTENDED_LOCALITIES,
    ]) ||
    isGbaPostalCode(address.zipcode)
  );
};

export const matchesShippingRateZone = (
  zone: ShippingRateZone,
  address: ShippingAddressInput
): boolean => {
  switch (zone) {
    case "caba":
      return isCabaAddress(address);
    case "gba_near":
      return (
        isGbaAddress(address) &&
        matchesLocalityList(address.city, address.locality, GBA_NEAR_LOCALITIES)
      );
    case "gba_extended":
      return (
        isGbaAddress(address) &&
        matchesLocalityList(
          address.city,
          address.locality,
          GBA_EXTENDED_LOCALITIES
        )
      );
    case "gba_all":
      return isGbaAddress(address);
    default:
      return false;
  }
};

export const matchesShippingRateZoneByPostalCode = (
  zone: ShippingRateZone,
  postalCode: string
): boolean => {
  const address: ShippingAddressInput = {
    city: "",
    province: "",
    zipcode: postalCode,
  };

  if (zone === "caba") {
    return isCabaPostalCode(postalCode);
  }

  if (zone === "gba_near" || zone === "gba_extended" || zone === "gba_all") {
    return isGbaPostalCode(postalCode) && !isCabaPostalCode(postalCode);
  }

  return matchesShippingRateZone(zone, address);
};

export const SHIPPING_RATE_ZONE_LABELS: Record<ShippingRateZone, string> = {
  caba: "Capital Federal (CABA)",
  gba_near: "GBA - zonas cercanas",
  gba_extended: "GBA - zonas extendidas",
  gba_all: "Gran Buenos Aires (todo GBA)",
};
