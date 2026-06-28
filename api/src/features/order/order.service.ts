import { tiendanubeApiClient } from "@config";
import { settingsRepository, shipmentRepository } from "@repository";
import {
  OrderSummary,
  TiendanubeOrder,
} from "@features/order/interfaces/order.interface";
import {
  extractShippingAddress,
  toShippingAddressInput,
} from "@features/order/order.mapper";
import {
  buildPostaShippingMatchContext,
  extractShippingSelection,
  matchesAppShippingMethod,
} from "@features/order/order-shipping";
import { StoreSettings } from "@features/settings/interfaces/store-settings.interface";
import { HttpErrorException } from "@utils";
import { validateDeliveryZone } from "@utils/zone";

class OrderService {
  async findAll(
    storeId: number,
    eligibleOnly = false
  ): Promise<OrderSummary[]> {
    const orders = await this.fetchOrders(storeId);
    const storeSettings = settingsRepository.getByStoreId(storeId);
    const summaries = orders.map((order) =>
      this.toOrderSummary(storeId, order, storeSettings)
    );

    if (!eligibleOnly) {
      return summaries;
    }

    return summaries.filter((order) => order.zone_eligibility.eligible);
  }

  async findOne(storeId: number, orderId: number): Promise<OrderSummary> {
    const order = await this.fetchOrder(storeId, orderId);

    if (!order) {
      throw new HttpErrorException("Pedido no encontrado").setStatusCode(404);
    }

    const storeSettings = settingsRepository.getByStoreId(storeId);

    return this.toOrderSummary(storeId, order, storeSettings);
  }

  async getOrderForShipment(
    storeId: number,
    orderId: number
  ): Promise<TiendanubeOrder> {
    const order = await this.fetchOrder(storeId, orderId);

    if (!order) {
      throw new HttpErrorException("Pedido no encontrado").setStatusCode(404);
    }

    return order;
  }

  private async fetchOrders(storeId: number): Promise<TiendanubeOrder[]> {
    return (await tiendanubeApiClient.get(`${storeId}/orders`, {
      params: {
        per_page: 50,
        aggregates: "fulfillment_orders",
      },
    })) as TiendanubeOrder[];
  }

  private async fetchOrder(
    storeId: number,
    orderId: number
  ): Promise<TiendanubeOrder | null> {
    try {
      return (await tiendanubeApiClient.get(`${storeId}/orders/${orderId}`, {
        params: {
          aggregates: "fulfillment_orders",
        },
      })) as TiendanubeOrder;
    } catch (error) {
      if (error instanceof HttpErrorException && error.statusCode === 404) {
        return null;
      }

      throw error;
    }
  }

  private toOrderSummary(
    storeId: number,
    order: TiendanubeOrder,
    storeSettings: StoreSettings
  ): OrderSummary {
    const shippingAddress = extractShippingAddress(order);
    const shippingSelection = extractShippingSelection(order);
    const existingShipment = shipmentRepository.findByOrderId(storeId, order.id);
    const shippingMethodLabel =
      shippingSelection?.option_name ??
      shippingSelection?.option_code ??
      shippingSelection?.carrier_name;

    if (!shippingAddress) {
      return {
        id: order.id,
        number: order.number,
        status: order.status,
        created_at: order.created_at,
        recipient_name: "Sin direccion",
        shipping_method: shippingMethodLabel,
        destination: {
          street: "",
          number: "",
          city: "",
          province: "",
          zipcode: "",
        },
        zone_eligibility: {
          eligible: false,
          reason: "El pedido no tiene direccion de envio.",
        },
        has_shipment: Boolean(existingShipment),
      };
    }

    const zoneValidation = validateDeliveryZone(
      toShippingAddressInput(shippingAddress)
    );
    const shippingValidation = matchesAppShippingMethod(
      shippingSelection,
      buildPostaShippingMatchContext(storeSettings)
    );

    const eligible = zoneValidation.eligible && shippingValidation.matches;
    const reason = !zoneValidation.eligible
      ? zoneValidation.reason
      : !shippingValidation.matches
        ? shippingValidation.reason
        : undefined;

    return {
      id: order.id,
      number: order.number,
      status: order.status,
      created_at: order.created_at,
      recipient_name: shippingAddress.name,
      shipping_method: shippingMethodLabel,
      destination: {
        street: shippingAddress.address,
        number: shippingAddress.number,
        floor: shippingAddress.floor,
        locality: shippingAddress.locality,
        city: shippingAddress.city,
        province: shippingAddress.province,
        zipcode: shippingAddress.zipcode,
        phone: shippingAddress.phone,
      },
      zone_eligibility: {
        eligible,
        zone: zoneValidation.zone,
        reason,
      },
      has_shipment: Boolean(existingShipment),
    };
  }
}

export default new OrderService();
