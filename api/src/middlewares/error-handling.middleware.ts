import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";

import { BadRequestException, HttpErrorException } from "@utils";
import { logError, logInfo } from "@utils/logger";

export const errorHandlingMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  if (!err) {
    return next();
  }

  logError("error", "Error capturado por middleware", err, {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl,
    query: req.query,
  });

  if (err instanceof HttpErrorException) {
    return res.status(err.statusCode).json(err);
  }

  if (err.hasOwnProperty("error") && err.hasOwnProperty("error_description")) {
    const payload = new BadRequestException(
      err.error as string,
      err.error_description
    );
    return res.status(payload.statusCode).json(payload);
  }

  const payload = new HttpErrorException(
    "Internal Server Error",
    err.message || JSON.stringify(err)
  );

  return res.status(payload.statusCode).json(payload);
};

export const logStartupState = (): void => {
  const dbPath = path.resolve("db.json");

  logInfo("startup", "Estado db.json al iniciar", {
    dbPath,
    dbExists: fs.existsSync(dbPath),
    cwd: process.cwd(),
  });
};
