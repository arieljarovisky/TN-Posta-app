import { NextFunction, Request, Response } from "express";
import fs from "fs";

import { getExpectedCallbackUrl, getOAuthInstallUrl, getStoreAdminAppUrl, getStoreAppsUrl } from "@config/oauth-urls";
import { getDatabasePath } from "@config/database";
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

  async reconnect(
    _req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<Response | void> {
    const oauthUrl = getOAuthInstallUrl();

    logInfo("auth/reconnect", "Redirigiendo a OAuth de Tiendanube", {
      oauthUrl,
    });

    return res.redirect(oauthUrl);
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
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const dbPath = getDatabasePath();
      const summary = userRepository.getCredentialsSummary();
      const callbackUrl = getExpectedCallbackUrl();
      const warnings: string[] = [];

      if (!process.env.APP_PUBLIC_URL) {
        warnings.push(
          "Falta APP_PUBLIC_URL. Ej: https://tn-posta-app-production.up.railway.app"
        );
      }

      if (!process.env.STORE_SLUG) {
        warnings.push(
          "Falta STORE_SLUG (ej. lupo15 para lupo15.mitiendanube.com)."
        );
      }

      if (summary.count === 0) {
        warnings.push(
          "La tienda no esta conectada (credentialsCount=0). Abri installUrl y completa OAuth."
        );
      }

      if (!process.env.DATABASE_PATH) {
        warnings.push(
          "Falta DATABASE_PATH=/data/db.json con volumen en Railway. Las credenciales se pierden en cada deploy."
        );
      }

      if (callbackUrl.startsWith("/")) {
        warnings.push(
          `En el Partner Portal la redirect URL debe ser la URL completa, no solo ${callbackUrl}`
        );
      }

      return res.status(StatusCode.OK).json({
        ok: summary.count > 0 && Boolean(process.env.APP_PUBLIC_URL),
        env: {
          CLIENT_ID: process.env.CLIENT_ID ?? null,
          CLIENT_EMAIL: process.env.CLIENT_EMAIL ?? null,
          hasClientSecret: Boolean(process.env.CLIENT_SECRET),
          hasSecretKey: Boolean(process.env.SECRET_KEY),
          APP_PUBLIC_URL: process.env.APP_PUBLIC_URL ?? null,
          STORE_SLUG: process.env.STORE_SLUG ?? null,
          DATABASE_PATH: process.env.DATABASE_PATH ?? null,
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
        callbackUrl,
        partnerPortal: {
          appUrl: process.env.APP_PUBLIC_URL ?? `${req.protocol}://${req.get("host")}`,
          redirectUrl: callbackUrl.startsWith("http")
            ? callbackUrl
            : `https://tn-posta-app-production.up.railway.app/auth/install`,
        },
        storeAdminAppUrl: getStoreAdminAppUrl() ?? null,
        storeAppsUrl: getStoreAppsUrl() ?? null,
        warnings,
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
