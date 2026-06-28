import { NextFunction, Request, Response } from "express";

import ShippingRatesService from "@features/shipping/shipping-rates.service";
import { TiendanubeRatesCallbackRequest } from "@features/shipping/interfaces/shipping.interfaces";
import { logInfo } from "@utils/logger";

class ShippingController {
  async calculateRates(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<Response | void> {
    const payload = req.body as TiendanubeRatesCallbackRequest;

    logInfo("shipping/rates", "Consulta de tarifas recibida", {
      storeId: payload.store_id,
      postalCode: payload.destination?.postal_code ?? null,
      city: payload.destination?.city ?? null,
      province: payload.destination?.province ?? null,
    });

    const rates = ShippingRatesService.calculateRates(payload);

    if (rates.length === 0) {
      return res.status(422).json({
        message: "Sin cobertura para la direccion indicada.",
      });
    }

    return res.status(200).json({ rates });
  }
}

export default new ShippingController();
