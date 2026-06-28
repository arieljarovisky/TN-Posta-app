import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";

import { getExpectedCallbackUrl, getOAuthInstallUrl } from "@config/oauth-urls";
import { InstallAppService, AuthService } from "@features/auth";
import { userRepository } from "@repository";
import { StatusCode } from "@utils";
import { logError, logInfo, maskCode } from "@utils/logger";

class AuthenticationController {
  async install(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<Response | void> {
    const code = req.query.code as string | undefined;

    logInfo("auth/install", "Callback de instalacion recibido", {
      hasCode: Boolean(code),
      code: maskCode(code),
      state: req.query.state ?? null,
      queryKeys: Object.keys(req.query),
      referer: req.get("referer") ?? null,
      userAgent: req.get("user-agent") ?? null,
    });

    try {
      if (!code) {
        logError("auth/install", "Callback sin codigo OAuth", undefined, {
          query: req.query,
        });
        return res.redirect("/?install=missing_code");
      }

      const credentials = await InstallAppService.install(code);

      logInfo("auth/install", "Instalacion completada, redirigiendo al home", {
        storeId: credentials.user_id,
      });

      return res.redirect("/?installed=1");
    } catch (e) {
      logError("auth/install", "Instalacion fallida", e, {
        code: maskCode(code),
      });

      const message =
        e instanceof Error ? e.message : "No se pudo completar la instalacion";
      const description =
        e instanceof Error && "description" in e
          ? String((e as { description?: string }).description ?? "")
          : "";

      return res.redirect(
        `/?install_error=${encodeURIComponent(
          description ? `${message}: ${description}` : message
        )}`
      );
    }
  }

  async status(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const summary = userRepository.getCredentialsSummary();

      logInfo("auth/status", "Consulta de estado de instalacion", summary);

      return res.status(StatusCode.OK).json({
        installed: summary.count > 0,
        store_id: summary.stores[0]?.store_id ?? null,
        stores: summary.stores,
      });
    } catch (e) {
      return next(e);
    }
  }

  async debug(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const dbPath = path.resolve("db.json");
      const summary = userRepository.getCredentialsSummary();

      return res.status(StatusCode.OK).json({
        env: {
          CLIENT_ID: process.env.CLIENT_ID ?? null,
          CLIENT_EMAIL: process.env.CLIENT_EMAIL ?? null,
          hasClientSecret: Boolean(process.env.CLIENT_SECRET),
          hasSecretKey: Boolean(process.env.SECRET_KEY),
          TIENDANUBE_AUTENTICATION_URL:
            process.env.TIENDANUBE_AUTENTICATION_URL ?? null,
          TIENDANUBE_API_URL: process.env.TIENDANUBE_API_URL ?? null,
          NODE_ENV: process.env.NODE_ENV ?? null,
          PORT: process.env.PORT ?? null,
        },
        db: {
          path: dbPath,
          exists: fs.existsSync(dbPath),
          credentialsCount: summary.count,
          stores: summary.stores,
        },
        installUrl: getOAuthInstallUrl(),
        callbackUrl: getExpectedCallbackUrl(),
      });
    } catch (e) {
      return next(e);
    }
  }

  async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const data = AuthService.login(req.body);
      return res.status(StatusCode.OK).json(data);
    } catch (e) {
      return next(e);
    }
  }
}

export default new AuthenticationController();
