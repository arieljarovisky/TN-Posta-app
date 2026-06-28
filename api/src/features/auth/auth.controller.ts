import { NextFunction, Request, Response } from "express";
import { StatusCode } from "@utils";
import { InstallAppService, AuthService } from "@features/auth";

class AuthenticationController {
  async install(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const code = req.query.code as string;

      if (!code) {
        return res.redirect("/?install=missing_code");
      }

      await InstallAppService.install(code);
      return res.redirect("/?installed=1");
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "No se pudo completar la instalacion";

      return res.redirect(
        `/?install_error=${encodeURIComponent(message)}`
      );
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
