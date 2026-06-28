import { randomUUID } from "crypto";
import { OrderService } from "@features/order";
import {
  extractShippingAddress,
  toShippingAddressInput,
} from "@features/order/order.mapper";
import {
  buildPostaShippingMatchContext,
  extractShippingSelection,
  matchesAppShippingMethod,
} from "@features/order/order-shipping";
import {
  CreateShipmentRequest,
  Shipment,
} from "@features/shipment/interfaces/shipment.interface";
import { isTrackingStatus, TrackingStatus } from "@features/shipment/interfaces/tracking.interface";
import TrackingService from "@features/shipment/tracking.service";
import { shipmentRepository, settingsRepository } from "@repository";
import { BadRequestException } from "@utils";
import { assertEligibleZone } from "@utils/zone";

const getShippingMethodLabel = (
  selection: ReturnType<typeof extractShippingSelection>
): string =>
  selection?.option_name ??
  selection?.carrier_name ??
  selection?.option_code ??
  "TN Posta";

const getTotalUnits = (): number => 0;

class ShipmentService {
  findAll(storeId: number): Shipment[] {
    return shipmentRepository.findAllByStore(storeId);
  }

  findOne(storeId: number, shipmentId: string): Shipment {
    return shipmentRepository.findById(storeId, shipmentId);
  }

  async create(storeId: number, payload: CreateShipmentRequest): Promise<Shipment> {
    const existingShipment = shipmentRepository.findByOrderId(
      storeId,
      payload.order_id
    );

    if (existingShipment) {
      throw new BadRequestException(
        "Envio ya existente",
        `El pedido #${existingShipment.order_number} ya tiene un envio creado.`
      );
    }

    const order = await OrderService.getOrderForShipment(storeId, payload.order_id);
    const shippingAddress = extractShippingAddress(order);
    const shippingSelection = extractShippingSelection(order);
    const storeSettings = settingsRepository.getByStoreId(storeId);
    const shippingValidation = matchesAppShippingMethod(
      shippingSelection,
      buildPostaShippingMatchContext(storeSettings)
    );

    if (!shippingValidation.matches) {
      throw new BadRequestException(
        "Metodo de envio invalido",
        shippingValidation.reason ??
          "El pedido no utilizo el metodo de envio configurado en TN Posta."
      );
    }

    if (!shippingAddress) {
      throw new BadRequestException(
        "Direccion incompleta",
        "El pedido no tiene una direccion de envio valida."
      );
    }

    const zone = assertEligibleZone(toShippingAddressInput(shippingAddress));
    const now = new Date().toISOString();

    const shipment: Shipment = {
      id: randomUUID(),
      store_id: storeId,
      order_id: order.id,
      order_number: order.number,
      status: "created",
      zone,
      recipient: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
      },
      destination: {
        street: shippingAddress.address,
        number: shippingAddress.number,
        floor: shippingAddress.floor,
        locality: shippingAddress.locality,
        city: shippingAddress.city,
        province: shippingAddress.province,
        zipcode: shippingAddress.zipcode,
      },
      notes: payload.notes,
      shipping_method: getShippingMethodLabel(shippingSelection),
      total_units: getTotalUnits(),
      created_at: now,
    };

    return shipmentRepository.save(shipment);
  }

  assignTracking(storeId: number, shipmentId: string): Shipment {
    return TrackingService.assignTracking(storeId, shipmentId);
  }

  updateTrackingStatus(
    storeId: number,
    shipmentId: string,
    status: TrackingStatus
  ): Shipment {
    if (!isTrackingStatus(status)) {
      throw new BadRequestException(
        "Estado invalido",
        "El estado de seguimiento no es valido."
      );
    }

    return TrackingService.updateStatus(storeId, shipmentId, status);
  }
}

export default new ShipmentService();
