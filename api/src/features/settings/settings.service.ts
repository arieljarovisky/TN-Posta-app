import { settingsRepository, userRepository } from "@repository";
import {
  normalizeShippingRates,
  ShippingCarrierService,
} from "@features/shipping";
import TrackingPageSyncService from "@features/storefront/tracking-page-sync.service";
import { StoreSettings } from "@features/settings/interfaces/store-settings.interface";
import { ShippingRateRule } from "@features/shipping/interfaces/shipping.interfaces";
import { BadRequestException } from "@utils";
import { SenderConfig } from "@features/settings/interfaces/store-settings.interface";
import {
  normalizeZoneLocalitiesMap,
  ZoneLocalitiesMap,
} from "@utils/zone/zone-coverage";

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

class SettingsService {
  getStoreSettings(storeId: number): StoreSettings {
    return settingsRepository.getByStoreId(storeId);
  }

  async updateStoreSettings(
    storeId: number,
    data: {
      enabled?: boolean;
      shipping_option_names?: string[];
      carrier_name?: string;
      shipping_rates?: ShippingRateRule[];
      zone_localities?: ZoneLocalitiesMap;
      sender?: SenderConfig;
      tracking_page_enabled?: boolean;
      tracking_page_title?: string;
    }
  ): Promise<{
    settings: StoreSettings;
    shipping_sync_message?: string;
    tracking_page_sync_message?: string;
    tracking_page_sync_ok?: boolean;
  }> {
    const current = settingsRepository.getByStoreId(storeId);
    const normalizedRates = data.shipping_rates
      ? normalizeShippingRates(data.shipping_rates)
      : current.shipping_rates?.length
        ? current.shipping_rates
        : DEFAULT_RATES;

    if (data.shipping_rates) {
      for (const rate of normalizedRates) {
        if (!rate.name.trim()) {
          throw new BadRequestException(
            "Tarifa invalida",
            "Cada tarifa debe tener un nombre."
          );
        }

        if (Number.isNaN(rate.price) || rate.price < 0) {
          throw new BadRequestException(
            "Tarifa invalida",
            "El precio debe ser un numero mayor o igual a 0."
          );
        }
      }
    }

    const shippingOptionNames = [
      ...new Set(
        [
          ...(data.shipping_option_names ?? current.shipping_option_names ?? []),
          ...normalizedRates.filter((rate) => rate.active).map((rate) => rate.name),
        ]
          .map((name) => name.trim())
          .filter(Boolean)
      ),
    ];

    const normalizedZoneLocalities = data.zone_localities
      ? normalizeZoneLocalitiesMap(data.zone_localities)
      : current.zone_localities;

    if (data.zone_localities) {
      for (const [zone, localities] of Object.entries(normalizedZoneLocalities ?? {})) {
        if (!localities?.length) {
          throw new BadRequestException(
            "Cobertura invalida",
            `La zona ${zone} debe tener al menos un barrio o localidad.`
          );
        }
      }
    }

    const normalizedSender = data.sender
      ? {
          business_name: String(data.sender.business_name ?? current.sender?.business_name ?? "TN Posta").trim(),
          address: data.sender.address?.trim() || current.sender?.address,
          city: data.sender.city?.trim() || current.sender?.city,
          phone: data.sender.phone?.trim() || current.sender?.phone,
        }
      : current.sender;

    const settings = settingsRepository.updateStoreSettings(storeId, {
      enabled: data.enabled ?? current.enabled,
      shipping_option_names: shippingOptionNames,
      carrier_name: data.carrier_name ?? current.carrier_name,
      shipping_rates: normalizedRates,
      zone_localities: normalizedZoneLocalities,
      sender: normalizedSender,
      tracking_page_enabled:
        data.tracking_page_enabled ?? current.tracking_page_enabled ?? false,
      tracking_page_title:
        data.tracking_page_title?.trim() ||
        current.tracking_page_title ||
        "Seguimiento de envio",
    });

    let shipping_sync_message: string | undefined;
    let tracking_page_sync_message: string | undefined;
    let tracking_page_sync_ok: boolean | undefined;

    const hasCredentials = Boolean(userRepository.findOptional(storeId)?.access_token);
    const trackingPageChanged =
      data.tracking_page_enabled !== undefined ||
      data.tracking_page_title !== undefined;

    if (hasCredentials && trackingPageChanged) {
      try {
        const syncResult = await TrackingPageSyncService.syncTrackingPage(storeId, {
          enabled: settings.tracking_page_enabled ?? false,
          title: settings.tracking_page_title ?? "Seguimiento de envio",
          existingPageId: settings.tracking_page_id,
        });

        tracking_page_sync_message = syncResult.message;
        tracking_page_sync_ok = syncResult.ok;
      } catch (error) {
        tracking_page_sync_message =
          error instanceof Error
            ? error.message
            : "No pudimos publicar la pagina en Tiendanube.";
        tracking_page_sync_ok = false;
      }
    }

    if (hasCredentials && (data.shipping_rates || data.carrier_name || data.enabled)) {
      const syncResult = await ShippingCarrierService.syncCarrierOptions(
        storeId,
        settings.shipping_rates ?? [],
        settings.carrier_name
      );

      shipping_sync_message = syncResult.message;

      if (syncResult.carrierId && !settings.carrier_id) {
        settingsRepository.updateCarrier(storeId, {
          carrier_id: syncResult.carrierId,
          carrier_name: settings.carrier_name,
        });
      }
    }

    return {
      settings: settingsRepository.getByStoreId(storeId),
      shipping_sync_message,
      tracking_page_sync_message,
      tracking_page_sync_ok,
    };
  }

  isServiceEnabled(storeId: number): boolean {
    return settingsRepository.isEnabled(storeId);
  }
}

export default new SettingsService();
