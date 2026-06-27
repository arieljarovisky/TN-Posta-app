import {
  TiendanubeFulfillment,
  TiendanubeOrder,
  TiendanubeShippingAddress,
} from "@features/order/interfaces/order.interface";
import { ShippingAddressInput } from "@utils/zone";

export const extractShippingAddress = (
  order: TiendanubeOrder
): TiendanubeShippingAddress | null => {
  if (order.shipping_address?.city && order.shipping_address?.province) {
    return order.shipping_address;
  }

  const fulfillment = order.fulfillments?.find(
    (item) => item.destination?.city && item.destination?.province
  );

  if (!fulfillment?.destination) {
    return null;
  }

  return mapFulfillmentToShippingAddress(fulfillment);
};

export const toShippingAddressInput = (
  address: TiendanubeShippingAddress
): ShippingAddressInput => ({
  city: address.city,
  province: address.province,
  zipcode: address.zipcode,
  locality: address.locality,
});

const mapFulfillmentToShippingAddress = (
  fulfillment: TiendanubeFulfillment
): TiendanubeShippingAddress => {
  const destination = fulfillment.destination!;
  const province =
    typeof destination.province === "string"
      ? destination.province
      : destination.province?.name ?? "";

  return {
    name: fulfillment.recipient?.name ?? "No informado",
    address: destination.street ?? "No informado",
    number: destination.number ?? "S/N",
    floor: destination.floor,
    locality: destination.locality,
    city: destination.city ?? "",
    province,
    zipcode: destination.zipcode ?? "0000",
    phone: fulfillment.recipient?.phone,
    country:
      typeof destination.country === "string"
        ? destination.country
        : destination.country?.name,
  };
};
