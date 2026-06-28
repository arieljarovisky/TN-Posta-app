import { Router } from "express";
import passport from "passport";

import { AuthenticationController } from "@features/auth";
import { OrderController } from "@features/order";
import { ProductController } from "@features/product";
import { SettingsController } from "@features/settings";
import { ShipmentController } from "@features/shipment";
import { ShippingController } from "@features/shipping";
import { ZoneController } from "@features/zone";
import { WebhookController } from "@features/webhook";
import { requireServiceEnabledMiddleware, requireStoreCredentialsMiddleware } from "@middlewares";

const routes = Router();
const apiRoutes = Router();

routes.get("/auth/install", AuthenticationController.install);
routes.get("/auth/status", AuthenticationController.status);
routes.get("/auth/debug", AuthenticationController.debug);

routes.post("/shipping/rates", ShippingController.calculateRates);

routes.post("/webhooks/store/redact", WebhookController.storeRedact);
routes.post("/webhooks/customers/redact", WebhookController.customersRedact);
routes.post(
  "/webhooks/customers/data_request",
  WebhookController.customersDataRequest
);

apiRoutes.get(
  "/zones/coverage",
  passport.authenticate("jwt", { session: false }),
  ZoneController.getCoverage
);

apiRoutes.get(
  "/settings",
  passport.authenticate("jwt", { session: false }),
  SettingsController.get
);
apiRoutes.patch(
  "/settings",
  passport.authenticate("jwt", { session: false }),
  SettingsController.update
);

apiRoutes.get(
  "/orders",
  passport.authenticate("jwt", { session: false }),
  requireStoreCredentialsMiddleware,
  requireServiceEnabledMiddleware,
  OrderController.getAll
);
apiRoutes.get(
  "/orders/:orderId",
  passport.authenticate("jwt", { session: false }),
  requireStoreCredentialsMiddleware,
  requireServiceEnabledMiddleware,
  OrderController.getOne
);

apiRoutes.get(
  "/shipments",
  passport.authenticate("jwt", { session: false }),
  requireStoreCredentialsMiddleware,
  requireServiceEnabledMiddleware,
  ShipmentController.getAll
);
apiRoutes.get(
  "/shipments/:shipmentId",
  passport.authenticate("jwt", { session: false }),
  requireStoreCredentialsMiddleware,
  requireServiceEnabledMiddleware,
  ShipmentController.getOne
);
apiRoutes.post(
  "/shipments",
  passport.authenticate("jwt", { session: false }),
  requireStoreCredentialsMiddleware,
  requireServiceEnabledMiddleware,
  ShipmentController.create
);
apiRoutes.get(
  "/shipments/:shipmentId/label",
  passport.authenticate("jwt", { session: false }),
  requireStoreCredentialsMiddleware,
  requireServiceEnabledMiddleware,
  ShipmentController.downloadLabel
);
apiRoutes.post(
  "/products",
  passport.authenticate("jwt", { session: false }),
  ProductController.create
);

apiRoutes.get(
  "/products/total",
  passport.authenticate("jwt", { session: false }),
  ProductController.getTotal
);
apiRoutes.get(
  "/products",
  passport.authenticate("jwt", { session: false }),
  ProductController.getAll
);
apiRoutes.delete(
  "/products/:id",
  passport.authenticate("jwt", { session: false }),
  ProductController.delete
);

routes.use("/api", apiRoutes);

export default routes;
