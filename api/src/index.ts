import express from "express";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";
import fs from "fs";
// @ts-ignore
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(".env"),
});

import { AppRoutes } from "@config";
import {
  authRequestLoggerMiddleware,
  beforeCheckClientMiddleware,
  errorHandlingMiddleware,
  logStartupState,
  oauthCallbackLoggerMiddleware,
} from "@middlewares";
import "./utils/passaport-strategy";
import { logEnvStatus } from "@utils/logger";

const port = process.env.PORT || 7200;
const app = express();
const frontendDist = path.resolve(process.cwd(), "../frontend/dist");

const serveFrontendIndex = (
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  const indexPath = path.join(frontendDist, "index.html");

  try {
    const configScript = `<script>window.__TN_POSTA_CONFIG__=${JSON.stringify({
      clientId: process.env.CLIENT_ID ?? "35321",
      storeSlug: process.env.STORE_SLUG ?? null,
      storeAdminUrl: process.env.STORE_ADMIN_URL ?? null,
    })};</script>`;
    const html = fs
      .readFileSync(indexPath, "utf8")
      .replace("<head>", `<head>${configScript}`);

    res.type("html").send(html);
  } catch (error) {
    next(error);
  }
};

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(express.json());
app.use(cors());
app.use(oauthCallbackLoggerMiddleware);
app.use(authRequestLoggerMiddleware);
app.use(beforeCheckClientMiddleware);
app.use(AppRoutes);

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist, { index: false }));

  app.get("/", serveFrontendIndex);
  app.get("*", (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    return serveFrontendIndex(req, res, next);
  });
}

app.use(errorHandlingMiddleware);

logEnvStatus();
logStartupState();

app.listen(port, () => {
  console.log(`Server started on port ${port}`);

  if (fs.existsSync(frontendDist)) {
    console.log(`Frontend served from ${frontendDist}`);
  }
});
