import { Shipment } from "@features/shipment/interfaces/shipment.interface";
import {
  isTrackingStatus,
  TRACKING_CODE_PATTERN,
  TRACKING_CODE_PREFIX,
  TRACKING_STATUS_LABELS,
  TrackingStatus,
} from "@features/shipment/interfaces/tracking.interface";
import { shipmentRepository } from "@repository";
import trackingSequenceRepository from "../../repository/TrackingSequenceRepository";
import { BadRequestException } from "@utils";

const formatTrackingCode = (sequence: number): string =>
  `${TRACKING_CODE_PREFIX}${String(sequence).padStart(8, "0")}`;

export const normalizeTrackingCode = (value: string): string =>
  String(value ?? "")
    .trim()
    .toUpperCase();

export const isValidTrackingCode = (value: string): boolean =>
  TRACKING_CODE_PATTERN.test(normalizeTrackingCode(value));

class TrackingService {
  findByTrackingCode(trackingCode: string): Shipment | undefined {
    const normalized = normalizeTrackingCode(trackingCode);

    return shipmentRepository.findByTrackingCode(normalized);
  }

  assignTracking(storeId: number, shipmentId: string): Shipment {
    const shipment = shipmentRepository.findById(storeId, shipmentId);

    if (shipment.tracking_code) {
      return shipment;
    }

    const sequence = trackingSequenceRepository.next();
    const now = new Date().toISOString();

    return shipmentRepository.update(storeId, shipmentId, {
      tracking_code: formatTrackingCode(sequence),
      tracking_status: "preparing",
      tracking_status_updated_at: now,
      status: "label_generated",
      label_generated_at: now,
    });
  }

  updateStatus(
    storeId: number,
    shipmentId: string,
    status: TrackingStatus
  ): Shipment {
    const shipment = shipmentRepository.findById(storeId, shipmentId);

    if (!shipment.tracking_code) {
      throw new BadRequestException(
        "Seguimiento no asignado",
        "Primero genera la etiqueta para asignar un codigo de seguimiento."
      );
    }

    const now = new Date().toISOString();

    return shipmentRepository.update(storeId, shipmentId, {
      tracking_status: status,
      tracking_status_updated_at: now,
    });
  }

  startTrip(trackingCode: string): {
    ok: boolean;
    reason?: string;
    shipment?: Shipment;
    alreadyStarted?: boolean;
  } {
    const shipment = this.findByTrackingCode(trackingCode);

    if (!shipment) {
      return { ok: false, reason: "not_found" };
    }

    const status = shipment.tracking_status ?? "preparing";

    if (status === "cancelled") {
      return { ok: false, reason: "cancelled" };
    }

    if (status === "delivered") {
      return { ok: false, reason: "already_delivered" };
    }

    if (status === "shipped") {
      return { ok: true, shipment, alreadyStarted: true };
    }

    const updated = shipmentRepository.update(shipment.store_id, shipment.id, {
      tracking_status: "shipped",
      tracking_status_updated_at: new Date().toISOString(),
    });

    return { ok: true, shipment: updated, alreadyStarted: false };
  }

  confirmDelivery(trackingCode: string): {
    ok: boolean;
    reason?: string;
    shipment?: Shipment;
    alreadyDelivered?: boolean;
  } {
    const shipment = this.findByTrackingCode(trackingCode);

    if (!shipment) {
      return { ok: false, reason: "not_found" };
    }

    const status = shipment.tracking_status ?? "preparing";

    if (status === "cancelled") {
      return { ok: false, reason: "cancelled" };
    }

    if (status === "delivered") {
      return { ok: true, shipment, alreadyDelivered: true };
    }

    if (status !== "shipped") {
      return { ok: false, reason: "not_shipped" };
    }

    const updated = shipmentRepository.update(shipment.store_id, shipment.id, {
      tracking_status: "delivered",
      tracking_status_updated_at: new Date().toISOString(),
    });

    return { ok: true, shipment: updated, alreadyDelivered: false };
  }

  getStatusLabel(status?: TrackingStatus): string {
    if (!status || !isTrackingStatus(status)) {
      return TRACKING_STATUS_LABELS.preparing;
    }

    return TRACKING_STATUS_LABELS[status];
  }
}

export default new TrackingService();
