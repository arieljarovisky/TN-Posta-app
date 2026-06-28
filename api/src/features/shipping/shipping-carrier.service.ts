import { randomUUID } from "crypto";

import { getShippingRatesCallbackUrl } from "@config/app-url";
import { tiendanubeApiClient } from "@config";
import {
  ShippingRateRule,
  TiendanubeCarrierOption,
  TiendanubeShippingCarrier,
} from "@features/shipping/interfaces/shipping.interfaces";
import { settingsRepository } from "@repository";
import { logError, logInfo } from "@utils/logger";

const DEFAULT_CARRIER_NAME = "TN Posta";

const slugifyCode = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);

export const normalizeShippingRates = (
  rates: ShippingRateRule[] | undefined
): ShippingRateRule[] => {
  const usedCodes = new Set<string>();

  return (rates ?? []).map((rate, index) => {
    const id = rate.id || randomUUID();
    const baseCode = slugifyCode(rate.code || `${rate.zone}_${rate.name}`) || `rate_${index + 1}`;
    let code = baseCode;
    let suffix = 1;

    while (usedCodes.has(code)) {
      code = `${baseCode}_${suffix}`;
      suffix += 1;
    }

    usedCodes.add(code);

    return {
      id,
      code,
      name: String(rate.name ?? "").trim(),
      zone: rate.zone,
      price: Number(rate.price),
      active: rate.active !== false,
    };
  });
};

class ShippingCarrierService {
  async ensureCarrier(
    storeId: number,
    carrierName = DEFAULT_CARRIER_NAME
  ): Promise<number | null> {
    const settings = settingsRepository.getByStoreId(storeId);
    const callbackUrl = getShippingRatesCallbackUrl();

    if (settings.carrier_id) {
      return settings.carrier_id;
    }

    try {
      const carriers = (await tiendanubeApiClient.get(
        `${storeId}/shipping_carriers`
      )) as TiendanubeShippingCarrier[];

      const existing = Array.isArray(carriers)
        ? carriers.find((carrier) => carrier.callback_url?.includes("/shipping/rates"))
        : undefined;

      if (existing?.id) {
        settingsRepository.updateCarrier(storeId, {
          carrier_id: existing.id,
          carrier_name: existing.name,
        });

        return existing.id;
      }

      const created = (await tiendanubeApiClient.post(
        `${storeId}/shipping_carriers`,
        {
          name: carrierName,
          callback_url: callbackUrl,
          types: "ship",
        }
      )) as TiendanubeShippingCarrier;

      settingsRepository.updateCarrier(storeId, {
        carrier_id: created.id,
        carrier_name: created.name,
      });

      logInfo("shipping/carrier", "Carrier creado en Tiendanube", {
        storeId,
        carrierId: created.id,
      });

      return created.id;
    } catch (error) {
      logError(
        "shipping/carrier",
        "No se pudo crear el carrier (requiere permiso Edit Shipping en Partner Portal)",
        error,
        { storeId }
      );

      return null;
    }
  }

  async syncCarrierOptions(
    storeId: number,
    rates: ShippingRateRule[],
    carrierName?: string
  ): Promise<{ synced: boolean; carrierId?: number; message?: string }> {
    const normalizedRates = normalizeShippingRates(rates).filter(
      (rate) => rate.name && rate.price >= 0
    );

    const carrierId = await this.ensureCarrier(
      storeId,
      carrierName?.trim() || DEFAULT_CARRIER_NAME
    );

    if (!carrierId) {
      return {
        synced: false,
        message:
          "Las tarifas se guardaron localmente. Para publicarlas en el checkout, activa Edit Shipping en el Partner Portal y reconecta la tienda (OAuth).",
      };
    }

    try {
      const existingOptions = (await tiendanubeApiClient.get(
        `${storeId}/shipping_carriers/${carrierId}/options`
      )) as TiendanubeCarrierOption[];

      const options = Array.isArray(existingOptions) ? existingOptions : [];
      const desiredCodes = new Set(
        normalizedRates.filter((rate) => rate.active).map((rate) => rate.code)
      );

      for (const rate of normalizedRates) {
        const existing = options.find((option) => option.code === rate.code);

        if (!existing) {
          await tiendanubeApiClient.post(
            `${storeId}/shipping_carriers/${carrierId}/options`,
            {
              code: rate.code,
              name: rate.name,
              allow_free_shipping: false,
            }
          );
          continue;
        }

        await tiendanubeApiClient.put(
          `${storeId}/shipping_carriers/${carrierId}/options/${existing.id}`,
          {
            name: rate.name,
            active: rate.active,
          }
        );
      }

      for (const option of options) {
        if (!desiredCodes.has(option.code) && option.active) {
          await tiendanubeApiClient.put(
            `${storeId}/shipping_carriers/${carrierId}/options/${option.id}`,
            {
              active: false,
            }
          );
        }
      }

      logInfo("shipping/carrier", "Opciones de envio sincronizadas", {
        storeId,
        carrierId,
        rates: normalizedRates.length,
      });

      return { synced: true, carrierId };
    } catch (error) {
      logError("shipping/carrier", "Error sincronizando opciones de envio", error, {
        storeId,
        carrierId,
      });

      return {
        synced: false,
        carrierId,
        message:
          "Las tarifas se guardaron, pero no se pudieron sincronizar con Tiendanube. Verifica Edit Shipping y reconecta la tienda.",
      };
    }
  }
}

export default new ShippingCarrierService();
