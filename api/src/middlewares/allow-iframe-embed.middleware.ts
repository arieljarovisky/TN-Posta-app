import { NextFunction, Request, Response } from "express";

import { isPublicShippingPagePath } from "@config/public-pages";

export const allowIframeEmbedMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!isPublicShippingPagePath(req.path)) {
    return next();
  }

  res.removeHeader("X-Frame-Options");
  res.setHeader("Content-Security-Policy", "frame-ancestors *");

  return next();
};
