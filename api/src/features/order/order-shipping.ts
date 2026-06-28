import { TiendanubeFulfillmentOrder, TiendanubeOrder } from "@features/order/interfaces/order.interface";

export interface OrderShippingSelection {
  method?: string;
  option_name?: string;
  option_code?: string;
  option_reference?: string;
  carrier_app_id?: string;
  carrier_id?: string;
  carrier_name?: string;
}

export interface PostaShippingMatchContext {
  carrierId?: number;
  carrierName?: string;
  rateCodes?: string[];
  rateNames?: string[];
  rateIds?: string[];
}

const normalize = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const extractShippingSelection = (
  order: TiendanubeOrder
): OrderShippingSelection | null => {
  const fulfillmentOrder = order.fulfillment_orders?.find(
    (item) => item.shipping?.option?.name || item.shipping?.carrier
  );

  if (fulfillmentOrder?.shipping) {
    const shipping = fulfillmentOrder.shipping;

    return {
      method: shipping.carrier?.code,
      option_name: shipping.option?.name,
      option_code: shipping.option?.code,
      option_reference: shipping.option?.reference ?? undefined,
      carrier_app_id: shipping.carrier?.app_id ?? undefined,
      carrier_id: shipping.carrier?.carrier_id,
      carrier_name: shipping.carrier?.name,
    };
  }

  if (
    order.shipping_option ||
    order.shipping_option_code ||
    order.shipping ||
    order.shipping_carrier_name
  ) {
    return {
      method: order.shipping,
      option_name: order.shipping_option,
      option_code: order.shipping_option_code,
      option_reference: order.shipping_option_reference ?? undefined,
      carrier_name: order.shipping_carrier_name ?? undefined,
    };
  }

  return null;
};

export const matchesAppShippingMethod = (
  selection: OrderShippingSelection | null,
  context: PostaShippingMatchContext = {}
): { matches: boolean; reason?: string } => {
  if (!selection) {
    return {
      matches: false,
      reason: "El pedido no tiene metodo de envio informado.",
    };
  }

  const appId = String(process.env.CLIENT_ID ?? "");
  const carrierName = context.carrierName?.trim() || "TN Posta";
  const normalizedCarrierName = normalize(carrierName);

  const normalizedRateCodes = (context.rateCodes ?? [])
    .map((code) => normalize(code))
    .filter(Boolean);
  const normalizedRateNames = (context.rateNames ?? [])
    .map((name) => normalize(name))
    .filter(Boolean);
  const normalizedRateIds = (context.rateIds ?? [])
    .map((id) => normalize(id))
    .filter(Boolean);

  if (selection.carrier_app_id && appId && selection.carrier_app_id === appId) {
    return { matches: true };
  }

  if (
    context.carrierId &&
    selection.carrier_id &&
    String(selection.carrier_id) === String(context.carrierId)
  ) {
    return { matches: true };
  }

  if (selection.carrier_name) {
    const normalizedOrderCarrier = normalize(selection.carrier_name);

    if (normalizedOrderCarrier === normalizedCarrierName) {
      return { matches: true };
    }
  }

  if (selection.option_code) {
    const normalizedCode = normalize(selection.option_code);

    if (normalizedRateCodes.includes(normalizedCode)) {
      return { matches: true };
    }
  }

  if (selection.option_reference) {
    const normalizedReference = normalize(selection.option_reference);

    if (normalizedRateIds.includes(normalizedReference)) {
      return { matches: true };
    }
  }

  if (selection.option_name) {
    const normalizedOptionName = normalize(selection.option_name);

    if (normalizedRateNames.includes(normalizedOptionName)) {
      return { matches: true };
    }
  }

  const selectedLabel =
    selection.option_name ??
    selection.option_code ??
    selection.carrier_name ??
    "Otro envio";

  return {
    matches: false,
    reason: `El cliente eligio "${selectedLabel}", que no es un envio de ${carrierName}.`,
  };
};

export const getFulfillmentOrders = (
  order: TiendanubeOrder
): TiendanubeFulfillmentOrder[] => order.fulfillment_orders ?? [];

export const buildPostaShippingMatchContext = (storeSettings: {
  carrier_id?: number;
  carrier_name?: string;
  shipping_rates?: Array<{
    id: string;
    code: string;
    name: string;
    active?: boolean;
  }>;
}): PostaShippingMatchContext => {
  const activeRates = (storeSettings.shipping_rates ?? []).filter(
    (rate) => rate.active !== false
  );

  return {
    carrierId: storeSettings.carrier_id,
    carrierName: storeSettings.carrier_name ?? "TN Posta",
    rateCodes: activeRates.map((rate) => rate.code),
    rateNames: activeRates.map((rate) => rate.name),
    rateIds: activeRates.map((rate) => rate.id),
  };
};
