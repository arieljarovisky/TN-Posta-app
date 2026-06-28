import { NextFunction, Request, Response } from "express";

import { HttpErrorException } from "@utils";
import { logError, logInfo } from "@utils/logger";

const requiredEnvKeys = [
  "TIENDANUBE_AUTENTICATION_URL",
  "TIENDANUBE_API_URL",
  "CLIENT_SECRET",
  "CLIENT_ID",
  "CLIENT_EMAIL",
];

export const beforeCheckClientMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];

  for (const key of requiredEnvKeys) {
    if (!process.env[key]) {
      errors.push(key);
    }
  }

  if (errors.length > 0) {
    logError("env", "Faltan variables de entorno requeridas", undefined, {
      missing: errors,
      path: req.path,
      method: req.method,
    });

    const message =
      "It is necessary to set request variables at .env-example file and rename it to .env";

    return next(
      new HttpErrorException(message, `envs: [${errors.join(",")}] is required`)
    );
  }

  if (req.path.startsWith("/auth")) {
    logInfo("env", "Variables de entorno OK para auth", {
      path: req.path,
      clientId: process.env.CLIENT_ID,
      authUrl: process.env.TIENDANUBE_AUTENTICATION_URL,
      apiUrl: process.env.TIENDANUBE_API_URL,
    });
  }

  return next();
};
