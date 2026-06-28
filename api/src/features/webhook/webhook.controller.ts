import { NextFunction, Request, Response } from "express";

import { WebhookService } from "@features/webhook";
import {
  CustomerDataRequestPayload,
  CustomerRedactPayload,
  StoreRedactPayload,
} from "@features/webhook/interfaces/webhook.interface";
import { StatusCode } from "@utils";

class WebhookController {
  async storeRedact(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      WebhookService.handleStoreRedact(req.body as StoreRedactPayload);
      return res.status(StatusCode.OK).json({ received: true });
    } catch (error) {
      return next(error);
    }
  }

  async customersRedact(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      WebhookService.handleCustomerRedact(req.body as CustomerRedactPayload);
      return res.status(StatusCode.OK).json({ received: true });
    } catch (error) {
      return next(error);
    }
  }

  async customersDataRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const payload = req.body as CustomerDataRequestPayload;
      const data = WebhookService.handleCustomerDataRequest(payload);

      console.info(
        `[LGPD] customers/data_request store=${payload.store_id} customer=${payload.customer.id}`,
        JSON.stringify(data)
      );

      return res.status(StatusCode.OK).json({ received: true });
    } catch (error) {
      return next(error);
    }
  }
}

export default new WebhookController();
