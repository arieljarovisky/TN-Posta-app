import { randomUUID } from "crypto";
import PDFDocument from "pdfkit";
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
import { shipmentRepository, settingsRepository } from "@repository";
import { BadRequestException } from "@utils";
import { assertEligibleZone } from "@utils/zone";

class LabelService {
  async generate(shipment: Shipment): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A6", margin: 24 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(14).text("TN Posta", { align: "center" });
      doc.fontSize(10).text("Etiqueta de envio personalizado", { align: "center" });
      doc.moveDown();

      doc.fontSize(9).text(`Envio: ${shipment.id}`);
      doc.text(`Pedido: #${shipment.order_number}`);
      doc.text(`Zona: ${shipment.zone}`);
      doc.text(`Fecha: ${new Date(shipment.created_at).toLocaleString("es-AR")}`);
      doc.moveDown();

      doc.fontSize(11).text("Destinatario", { underline: true });
      doc.fontSize(10).text(shipment.recipient.name);
      if (shipment.recipient.phone) {
        doc.text(`Tel: ${shipment.recipient.phone}`);
      }
      doc.moveDown();

      doc.fontSize(11).text("Direccion", { underline: true });
      doc.fontSize(10);
      doc.text(
        `${shipment.destination.street} ${shipment.destination.number}${
          shipment.destination.floor ? `, ${shipment.destination.floor}` : ""
        }`
      );
      if (shipment.destination.locality) {
        doc.text(shipment.destination.locality);
      }
      doc.text(`${shipment.destination.city}, ${shipment.destination.province}`);
      doc.text(`CP ${shipment.destination.zipcode}`);

      if (shipment.notes) {
        doc.moveDown();
        doc.fontSize(11).text("Observaciones", { underline: true });
        doc.fontSize(10).text(shipment.notes);
      }

      doc.end();
    });
  }
}

class ShipmentService {
  private labelService = new LabelService();

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
      created_at: now,
    };

    return shipmentRepository.save(shipment);
  }

  async generateLabel(storeId: number, shipmentId: string): Promise<Buffer> {
    const shipment = shipmentRepository.findById(storeId, shipmentId);

    if (shipment.status !== "label_generated") {
      shipmentRepository.update(storeId, shipmentId, {
        status: "label_generated",
        label_generated_at: new Date().toISOString(),
      });
    }

    return this.labelService.generate(
      shipmentRepository.findById(storeId, shipmentId)
    );
  }
}

export default new ShipmentService();
