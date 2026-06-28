import { NextFunction, Request, Response } from "express";

import { logInfo, maskCode } from "@utils/logger";

export const oauthCallbackLoggerMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const code = req.query.code;

  if (typeof code === "string" && code.length > 0) {
    logInfo("oauth/callback", "Query OAuth detectado en request", {
      method: req.method,
      path: req.path,
      originalUrl: req.originalUrl,
      code: maskCode(code),
      state: req.query.state ?? null,
      referer: req.get("referer") ?? "unknown",
      userAgent: req.get("user-agent") ?? "unknown",
      expectedCallback: "/auth/install",
      hitsCallbackDirectly: req.path === "/auth/install",
    });
  }

  return next();
};
