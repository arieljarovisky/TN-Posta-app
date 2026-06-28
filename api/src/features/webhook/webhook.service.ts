import { settingsRepository, shipmentRepository, userRepository } from "@repository";
import {
  CustomerDataRequestPayload,
  CustomerRedactPayload,
  StoreRedactPayload,
} from "@features/webhook/interfaces/webhook.interface";

class WebhookService {
  handleStoreRedact(payload: StoreRedactPayload): void {
    userRepository.deleteByStoreId(payload.store_id);
    shipmentRepository.deleteByStoreId(payload.store_id);
    settingsRepository.deleteByStoreId(payload.store_id);
  }

  handleCustomerRedact(payload: CustomerRedactPayload): void {
    shipmentRepository.deleteByOrderIds(
      payload.store_id,
      payload.orders_to_redact ?? []
    );
  }

  handleCustomerDataRequest(payload: CustomerDataRequestPayload): {
    store_id: number;
    customer_id: number;
    shipments: ReturnType<typeof shipmentRepository.findAllByStore>;
  } {
    const shipments = shipmentRepository
      .findAllByStore(payload.store_id)
      .filter((shipment) =>
        payload.orders_requested?.includes(shipment.order_id)
      );

    return {
      store_id: payload.store_id,
      customer_id: payload.customer.id,
      shipments,
    };
  }
}

export default new WebhookService();
