import { NextFunction, Request, Response } from "express";

import { settingsRepository } from "@repository";
import { HttpErrorException } from "@utils";

export const requireServiceEnabledMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const storeId = Number(req.user?.user_id);

  if (!settingsRepository.isEnabled(storeId)) {
    return next(
      new HttpErrorException(
        "Servicio desactivado",
        "Activa TN Posta desde la pantalla principal para gestionar envios."
      ).setStatusCode(403)
    );
  }

  return next();
};
