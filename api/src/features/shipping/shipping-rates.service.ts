import {
  ShippingRateRule,
  TiendanubeRatesCallbackRequest,
  TiendanubeShippingRateResponse,
} from "@features/shipping/interfaces/shipping.interfaces";
import { settingsRepository } from "@repository";
import { ShippingAddressInput } from "@utils/zone";
import {
  matchesShippingRateZone,
  matchesShippingRateZoneByPostalCode,
} from "@utils/zone/shipping-rate-zones";

const toAddressInput = (
  destination: TiendanubeRatesCallbackRequest["destination"]
): ShippingAddressInput => ({
  city: destination.city ?? "",
  province: destination.province ?? "",
  zipcode: destination.postal_code ?? "",
  locality: destination.locality ?? undefined,
});

const hasFullAddress = (
  destination: TiendanubeRatesCallbackRequest["destination"]
): boolean =>
  Boolean(
    destination.city ||
      destination.province ||
      destination.locality ||
      destination.address
  );

const calculateMixedCartPrice = (
  rate: ShippingRateRule,
  items: TiendanubeRatesCallbackRequest["items"] = []
): { price: number; price_merchant: number } => {
  const hasPaidItems = items.some((item) => !item.free_shipping);
  const hasFreeItems = items.some((item) => item.free_shipping);

  if (!hasPaidItems || !hasFreeItems) {
    return { price: rate.price, price_merchant: rate.price };
  }

  const paidShare =
    items.filter((item) => !item.free_shipping).length / Math.max(items.length, 1);
  const discountedPrice = Math.max(0, Math.round(rate.price * paidShare));

  return {
    price: discountedPrice,
    price_merchant: rate.price,
  };
};

class ShippingRatesService {
  calculateRates(
    payload: TiendanubeRatesCallbackRequest
  ): TiendanubeShippingRateResponse[] {
    const storeId = Number(payload.store_id);
    const settings = settingsRepository.getByStoreId(storeId);

    if (!settings.enabled) {
      return [];
    }

    const activeRates = (settings.shipping_rates ?? []).filter((rate) => rate.active);

    if (activeRates.length === 0) {
      return [];
    }

    const destination = payload.destination ?? {};
    const postalCode = destination.postal_code ?? "";
    const address = toAddressInput(destination);
    const useFullAddress = hasFullAddress(destination);

    const matchingRates = activeRates.filter((rate) =>
      useFullAddress
        ? matchesShippingRateZone(rate.zone, address, settings.zone_localities)
        : postalCode
          ? matchesShippingRateZoneByPostalCode(
              rate.zone,
              postalCode,
              settings.zone_localities
            )
          : false
    );

    const currency = payload.currency || "ARS";

    return matchingRates.map((rate) => {
      const prices = calculateMixedCartPrice(rate, payload.items);

      return {
        name: rate.name,
        code: rate.code,
        price: prices.price,
        price_merchant: prices.price_merchant,
        currency,
        type: "ship" as const,
        reference: rate.id,
      };
    });
  }

  getConfiguredRateCodes(storeId: number): string[] {
    const settings = settingsRepository.getByStoreId(storeId);

    return (settings.shipping_rates ?? [])
      .filter((rate) => rate.active)
      .map((rate) => rate.code);
  }

  getConfiguredRateNames(storeId: number): string[] {
    const settings = settingsRepository.getByStoreId(storeId);

    return (settings.shipping_rates ?? [])
      .filter((rate) => rate.active)
      .map((rate) => rate.name);
  }
}

export default new ShippingRatesService();
