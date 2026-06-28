import { NextFunction, Request, Response } from "express";

import { settingsRepository } from "@repository";
import { StatusCode } from "@utils";
import { getAllZoneCoverage } from "@utils/zone/zone-coverage";

class ZoneController {
  async getCoverage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const storeId = +req.user.user_id;
      const settings = settingsRepository.getByStoreId(storeId);

      return res.status(StatusCode.OK).json({
        zones: getAllZoneCoverage(settings.zone_localities),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ZoneController();
