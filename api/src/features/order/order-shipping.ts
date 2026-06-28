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

const normalize = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getConfiguredShippingNames = (
  storeShippingNames?: string[]
): string[] => {
  if (storeShippingNames?.length) {
    return storeShippingNames.map((name) => name.trim()).filter(Boolean);
  }

  const fromEnv = process.env.SHIPPING_OPTION_NAMES;

  if (!fromEnv) {
    return [];
  }

  return fromEnv
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
};

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
  storeShippingNames?: string[],
  configuredRateCodes?: string[]
): { matches: boolean; reason?: string } => {
  if (!selection) {
    return {
      matches: false,
      reason: "El pedido no tiene metodo de envio informado.",
    };
  }

  const appId = String(process.env.CLIENT_ID ?? "");
  const configuredNames = getConfiguredShippingNames(storeShippingNames);

  if (selection.carrier_app_id && appId && selection.carrier_app_id === appId) {
    return { matches: true };
  }

  if (selection.carrier_id && appId && selection.carrier_id === appId) {
    return { matches: true };
  }

  const normalizedCodes = (configuredRateCodes ?? [])
    .map((code) => normalize(code))
    .filter(Boolean);

  if (
    selection.option_code &&
    normalizedCodes.includes(normalize(selection.option_code))
  ) {
    return { matches: true };
  }

  if (configuredNames.length === 0) {
    return {
      matches: false,
      reason:
        "Configura el nombre del envio en la app para identificar pedidos con tu metodo de envio.",
    };
  }

  const candidates = [
    selection.option_name,
    selection.option_code,
    selection.option_reference,
    selection.carrier_name,
  ]
    .filter(Boolean)
    .map((value) => normalize(value!));

  const matches = candidates.some((candidate) =>
    configuredNames.some((configuredName) => {
      const normalizedName = normalize(configuredName);

      return (
        candidate === normalizedName ||
        candidate.includes(normalizedName) ||
        normalizedName.includes(candidate)
      );
    })
  );

  if (matches) {
    return { matches: true };
  }

  const selectedLabel =
    selection.option_name ??
    selection.option_code ??
    selection.carrier_name ??
    "Otro envio";

  return {
    matches: false,
    reason: `El cliente eligio "${selectedLabel}", que no coincide con tu metodo de envio configurado.`,
  };
};

export const getFulfillmentOrders = (
  order: TiendanubeOrder
): TiendanubeFulfillmentOrder[] => order.fulfillment_orders ?? [];
