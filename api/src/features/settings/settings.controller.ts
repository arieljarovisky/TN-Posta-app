import { NextFunction, Request, Response } from "express";

import SettingsService from "@features/settings/settings.service";
import { UpdateStoreSettingsRequest } from "@features/settings/interfaces/store-settings.interface";
import { userRepository } from "@repository";
import { BadRequestException, StatusCode } from "@utils";

class SettingsController {
  async get(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const data = SettingsService.getStoreSettings(+req.user.user_id);
      const connected = Boolean(
        userRepository.findOptional(+req.user.user_id)?.access_token
      );

      return res.status(StatusCode.OK).json({
        enabled: data.enabled,
        connected,
        shipping_option_names: data.shipping_option_names ?? [],
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

      if (
        payload.enabled !== undefined &&
        typeof payload.enabled !== "boolean"
      ) {
        throw new BadRequestException(
          "Invalid payload",
          "El campo enabled debe ser true o false"
        );
      }

      if (
        payload.shipping_option_names !== undefined &&
        !Array.isArray(payload.shipping_option_names)
      ) {
        throw new BadRequestException(
          "Invalid payload",
          "shipping_option_names debe ser un array de strings"
        );
      }

      const data = SettingsService.updateStoreSettings(+req.user.user_id, {
        enabled: payload.enabled,
        shipping_option_names: payload.shipping_option_names?.map((name) =>
          String(name).trim()
        ),
      });
      const connected = Boolean(
        userRepository.findOptional(+req.user.user_id)?.access_token
      );

      return res.status(StatusCode.OK).json({
        enabled: data.enabled,
        connected,
        shipping_option_names: data.shipping_option_names ?? [],
        updated_at: data.updated_at,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SettingsController();
