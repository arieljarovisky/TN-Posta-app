import { NextFunction, Request, Response } from "express";
import { ShipmentService } from "@features/shipment";
import { CreateShipmentRequest } from "@features/shipment/interfaces/shipment.interface";
import { StatusCode } from "@utils";

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

  async downloadLabel(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const shipment = ShipmentService.findOne(
        +req.user.user_id,
        req.params.shipmentId
      );
      const pdf = await ShipmentService.generateLabel(
        +req.user.user_id,
        req.params.shipmentId
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="etiqueta-pedido-${shipment.order_number}.pdf"`
      );

      return res.status(StatusCode.OK).send(pdf);
    } catch (error) {
      next(error);
    }
  }
}

export default new ShipmentController();
