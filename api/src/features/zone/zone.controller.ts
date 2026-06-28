import { NextFunction, Request, Response } from "express";

import { StatusCode } from "@utils";
import { getAllZoneCoverage } from "@utils/zone/zone-coverage";

class ZoneController {
  async getCoverage(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      return res.status(StatusCode.OK).json({
        zones: getAllZoneCoverage(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ZoneController();
