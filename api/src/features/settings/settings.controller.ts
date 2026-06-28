import { NextFunction, Request, Response } from "express";

import SettingsService from "@features/settings/settings.service";
import { UpdateStoreSettingsRequest } from "@features/settings/interfaces/store-settings.interface";
import { ShippingRateRule } from "@features/shipping/interfaces/shipping.interfaces";
import { userRepository } from "@repository";
import { BadRequestException, StatusCode } from "@utils";
import { getAllZoneCoverage } from "@utils/zone/zone-coverage";
import {
  getPublicEmbedHtml,
  getPublicEmbedScriptHtml,
  getPublicEmbedScriptUrl,
  getPublicTrackingPageUrl,
  getStorePublicUrl,
} from "@config/oauth-urls";
import { StoreSettings } from "@features/settings/interfaces/store-settings.interface";

const buildSettingsResponse = (
  data: StoreSettings,
  req: Request,
  connected: boolean,
  shipping_sync_message?: string,
  tracking_page_sync_message?: string,
  tracking_page_sync_ok?: boolean
) => ({
  enabled: data.enabled,
  connected,
  shipping_option_names: data.shipping_option_names ?? [],
  carrier_id: data.carrier_id ?? null,
  carrier_name: data.carrier_name ?? "TN Posta",
  shipping_rates: data.shipping_rates ?? [],
  zone_localities: getAllZoneCoverage(data.zone_localities).reduce(
    (acc, zone) => {
      acc[zone.zone] = zone.localities;
      return acc;
    },
    {} as Record<string, string[]>
  ),
  sender: data.sender ?? {
    business_name: data.carrier_name ?? "TN Posta",
  },
  tracking_page_enabled: data.tracking_page_enabled ?? false,
  tracking_page_title: data.tracking_page_title ?? "Seguimiento de envio",
  tracking_page_url: getPublicTrackingPageUrl(req),
  tracking_page_public_url: data.tracking_page_public_url ?? null,
  tracking_page_embed_script_url: getPublicEmbedScriptUrl(req),
  tracking_page_embed_html: getPublicEmbedHtml(req),
  tracking_page_embed_script_html: getPublicEmbedScriptHtml(req),
  tracking_page_sync_message,
  tracking_page_sync_ok,
  store_public_url: getStorePublicUrl() ?? null,
  shipping_sync_message,
  updated_at: data.updated_at,
});

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

      return res.status(StatusCode.OK).json(
        buildSettingsResponse(
          {
            ...data,
            shipping_rates: data.shipping_rates?.length
              ? data.shipping_rates
              : DEFAULT_RATES,
          },
          req,
          connected
        )
      );
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

      if (
        payload.zone_localities !== undefined &&
        (typeof payload.zone_localities !== "object" ||
          payload.zone_localities === null ||
          Array.isArray(payload.zone_localities))
      ) {
        throw new BadRequestException(
          "Invalid payload",
          "zone_localities debe ser un objeto con listas de barrios por zona"
        );
      }

      if (
        payload.tracking_page_enabled !== undefined &&
        typeof payload.tracking_page_enabled !== "boolean"
      ) {
        throw new BadRequestException(
          "Invalid payload",
          "tracking_page_enabled debe ser true o false"
        );
      }

      const { settings, shipping_sync_message, tracking_page_sync_message, tracking_page_sync_ok } =
        await SettingsService.updateStoreSettings(+req.user.user_id, {
          enabled: payload.enabled,
          shipping_option_names: payload.shipping_option_names?.map((name) =>
            String(name).trim()
          ),
          carrier_name: payload.carrier_name?.trim(),
          shipping_rates: payload.shipping_rates,
          zone_localities: payload.zone_localities,
          sender: payload.sender,
          tracking_page_enabled: payload.tracking_page_enabled,
          tracking_page_title: payload.tracking_page_title?.trim(),
        });
      const connected = Boolean(
        userRepository.findOptional(+req.user.user_id)?.access_token
      );

      return res.status(StatusCode.OK).json(
        buildSettingsResponse(
          {
            ...settings,
            shipping_rates: settings.shipping_rates ?? [],
          },
          req,
          connected,
          shipping_sync_message,
          tracking_page_sync_message,
          tracking_page_sync_ok
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new SettingsController();
