import { NextFunction, Request, Response } from "express";

import SettingsService from "@features/settings/settings.service";
import { UpdateStoreSettingsRequest } from "@features/settings/interfaces/store-settings.interface";
import { ShippingRateRule } from "@features/shipping/interfaces/shipping.interfaces";
import { userRepository } from "@repository";
import { BadRequestException, StatusCode } from "@utils";

const DEFAULT_RATES: ShippingRateRule[] = [
  {
    id: "default-caba",
    code: "envio_caba",
    name: "ENVIO EXPRESS - CABA",
    zone: "caba",
    price: 4500,
    active: true,
  },
  {
    id: "default-gba-near",
    code: "envio_gba_cercano",
    name: "ENVIO EXPRESS - GBA cercano",
    zone: "gba_near",
    price: 6500,
    active: true,
  },
  {
    id: "default-gba-extended",
    code: "envio_gba_extendido",
    name: "ENVIO EXPRESS - GBA extendido",
    zone: "gba_extended",
    price: 8500,
    active: true,
  },
];

const isValidShippingRate = (rate: ShippingRateRule): boolean =>
  Boolean(rate?.name) &&
  typeof rate.price === "number" &&
  ["caba", "gba_near", "gba_extended", "gba_all"].includes(rate.zone);

class SettingsController {
  async get(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const data = SettingsService.getStoreSettings(+req.user.user_id);
      const connected = Boolean(
        userRepository.findOptional(+req.user.user_id)?.access_token
      );

      return res.status(StatusCode.OK).json({
        enabled: data.enabled,
        connected,
        shipping_option_names: data.shipping_option_names ?? [],
        carrier_id: data.carrier_id ?? null,
        carrier_name: data.carrier_name ?? "TN Posta",
        shipping_rates:
          data.shipping_rates?.length ? data.shipping_rates : DEFAULT_RATES,
        updated_at: data.updated_at,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const payload = req.body as UpdateStoreSettingsRequest;

      if (
        payload.enabled !== undefined &&
        typeof payload.enabled !== "boolean"
      ) {
        throw new BadRequestException(
          "Invalid payload",
          "El campo enabled debe ser true o false"
        );
      }

      if (
        payload.shipping_option_names !== undefined &&
        !Array.isArray(payload.shipping_option_names)
      ) {
        throw new BadRequestException(
          "Invalid payload",
          "shipping_option_names debe ser un array de strings"
        );
      }

      if (
        payload.shipping_rates !== undefined &&
        (!Array.isArray(payload.shipping_rates) ||
          !payload.shipping_rates.every(isValidShippingRate))
      ) {
        throw new BadRequestException(
          "Invalid payload",
          "shipping_rates debe ser un array con nombre, zona y precio validos"
        );
      }

      const { settings, shipping_sync_message } =
        await SettingsService.updateStoreSettings(+req.user.user_id, {
          enabled: payload.enabled,
          shipping_option_names: payload.shipping_option_names?.map((name) =>
            String(name).trim()
          ),
          carrier_name: payload.carrier_name?.trim(),
          shipping_rates: payload.shipping_rates,
        });
      const connected = Boolean(
        userRepository.findOptional(+req.user.user_id)?.access_token
      );

      return res.status(StatusCode.OK).json({
        enabled: settings.enabled,
        connected,
        shipping_option_names: settings.shipping_option_names ?? [],
        carrier_id: settings.carrier_id ?? null,
        carrier_name: settings.carrier_name ?? "TN Posta",
        shipping_rates: settings.shipping_rates ?? [],
        shipping_sync_message,
        updated_at: settings.updated_at,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SettingsController();
