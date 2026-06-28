import { NextFunction, Request, Response } from "express";

import { HttpErrorException } from "@utils";

export const requireStoreCredentialsMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user?.access_token) {
    return next(
      new HttpErrorException(
        "Tienda no autorizada",
        "Reinstala la app desde Tiendanube para volver a conectar la tienda."
      ).setStatusCode(401)
    );
  }

  return next();
};
