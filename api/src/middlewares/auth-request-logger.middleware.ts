import { NextFunction, Request, Response } from "express";

import { logInfo } from "@utils/logger";

export const authRequestLoggerMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.path.startsWith("/auth")) {
    return next();
  }

  logInfo("auth/request", "Solicitud recibida", {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    query: req.query,
    ip: req.ip,
    userAgent: req.get("user-agent") ?? "unknown",
    referer: req.get("referer") ?? "unknown",
  });

  return next();
};
