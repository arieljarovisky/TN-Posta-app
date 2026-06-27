import { NextFunction, Request, Response } from "express";
import { OrderService } from "@features/order";
import { StatusCode } from "@utils";

class OrderController {
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const eligibleOnly = req.query.eligible_only === "true";
      const data = await OrderService.findAll(+req.user.user_id, eligibleOnly);
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
      const data = await OrderService.findOne(
        +req.user.user_id,
        +req.params.orderId
      );
      return res.status(StatusCode.OK).json(data);
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
