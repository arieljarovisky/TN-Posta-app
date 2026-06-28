import path from "path";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import { Shipment } from "@features/shipment/interfaces/shipment.interface";
import { HttpErrorException } from "@utils";

interface IDatabase {
  shipments: Shipment[];
}

const adapter = new FileSync<IDatabase>(path.resolve("db.json"));
const database = low(adapter);

database.defaults({ shipments: [] }).write();

class ShipmentRepository {
  findAllByStore(storeId: number): Shipment[] {
    return database
      .get("shipments")
      .filter({ store_id: storeId })
      .sortBy("created_at")
      .reverse()
      .value();
  }

  findById(storeId: number, shipmentId: string): Shipment {
    const shipment = database
      .get("shipments")
      .find({ id: shipmentId, store_id: storeId })
      .value();

    if (!shipment) {
      throw new HttpErrorException("Envio no encontrado").setStatusCode(404);
    }

    return shipment;
  }

  findByOrderId(storeId: number, orderId: number): Shipment | undefined {
    return database
      .get("shipments")
      .find({ store_id: storeId, order_id: orderId })
      .value();
  }

  save(shipment: Shipment): Shipment {
    database.get("shipments").push(shipment).write();
    return shipment;
  }

  update(storeId: number, shipmentId: string, data: Partial<Shipment>): Shipment {
    const shipment = this.findById(storeId, shipmentId);
    const updated = { ...shipment, ...data };

    database
      .get("shipments")
      .find({ id: shipmentId, store_id: storeId })
      .assign(updated)
      .write();

    return updated;
  }

  deleteByStoreId(storeId: number): void {
    const shipments =
      database
        .get("shipments")
        .value()
        ?.filter((shipment) => shipment.store_id !== Number(storeId)) ?? [];

    database.set("shipments", shipments).write();
  }

  deleteByOrderIds(storeId: number, orderIds: number[]): void {
    const orderIdSet = new Set(orderIds.map(Number));
    const shipments =
      database
        .get("shipments")
        .value()
        ?.filter(
          (shipment) =>
            shipment.store_id !== Number(storeId) ||
            !orderIdSet.has(shipment.order_id)
        ) ?? [];

    database.set("shipments", shipments).write();
  }
}

export default new ShipmentRepository();
