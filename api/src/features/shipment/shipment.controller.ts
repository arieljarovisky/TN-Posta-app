import { NextFunction, Request, Response } from "express";

import { ShipmentService } from "@features/shipment";
import { CreateShipmentRequest } from "@features/shipment/interfaces/shipment.interface";
import { isTrackingStatus } from "@features/shipment/interfaces/tracking.interface";
import { settingsRepository } from "@repository";
import { BadRequestException, StatusCode } from "@utils";

class ShipmentController {
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const data = ShipmentService.findAll(+req.user.user_id);
      return res.status(StatusCode.OK).json(data);
    } catch (error) {
      next(error);
    }
  }

  async getOne(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const data = ShipmentService.findOne(
        +req.user.user_id,
        req.params.shipmentId
      );
      return res.status(StatusCode.OK).json(data);
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const payload = req.body as CreateShipmentRequest;
      const data = await ShipmentService.create(+req.user.user_id, payload);
      return res.status(StatusCode.CREATED).json(data);
    } catch (error) {
      next(error);
    }
  }

  async assignTracking(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const storeId = +req.user.user_id;
      const shipmentId = req.params.shipmentId;
      const existing = ShipmentService.findOne(storeId, shipmentId);
      const assigned = Boolean(existing.tracking_code);
      const shipment = ShipmentService.assignTracking(storeId, shipmentId);
      const settings = settingsRepository.getByStoreId(storeId);

      return res.status(StatusCode.OK).json({
        shipment,
        trackingCode: shipment.tracking_code,
        assigned: !assigned,
        trackingStatus: shipment.tracking_status,
        sender: settings.sender ?? null,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTrackingStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const status = req.body?.status;

      if (!isTrackingStatus(status)) {
        throw new BadRequestException(
          "Estado invalido",
          "El estado de seguimiento no es valido."
        );
      }

      const shipment = ShipmentService.updateTrackingStatus(
        +req.user.user_id,
        req.params.shipmentId,
        status
      );

      return res.status(StatusCode.OK).json(shipment);
    } catch (error) {
      next(error);
    }
  }
}

export default new ShipmentController();
