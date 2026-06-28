import { NextFunction, Request, Response } from "express";

import SettingsService from "@features/settings/settings.service";
import { UpdateStoreSettingsRequest } from "@features/settings/interfaces/store-settings.interface";
import { BadRequestException, StatusCode } from "@utils";

class SettingsController {
  async get(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const data = SettingsService.getStoreSettings(+req.user.user_id);

      return res.status(StatusCode.OK).json({
        enabled: data.enabled,
        updated_at: data.updated_at,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const payload = req.body as UpdateStoreSettingsRequest;

      if (typeof payload.enabled !== "boolean") {
        throw new BadRequestException(
          "Invalid payload",
          "El campo enabled debe ser true o false"
        );
      }

      const data = SettingsService.updateStoreSettings(
        +req.user.user_id,
        payload.enabled
      );

      return res.status(StatusCode.OK).json({
        enabled: data.enabled,
        updated_at: data.updated_at,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SettingsController();
