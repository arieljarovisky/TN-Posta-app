import { Router } from "express";
import passport from "passport";

import { AuthenticationController } from "@features/auth";
import { OrderController } from "@features/order";
import { ProductController } from "@features/product";
import { SettingsController } from "@features/settings";
import { ShipmentController } from "@features/shipment";
import { WebhookController } from "@features/webhook";
import { requireServiceEnabledMiddleware } from "@middlewares";

const routes = Router();
const apiRoutes = Router();

routes.get("/auth/install", AuthenticationController.install);
routes.get("/auth/status", AuthenticationController.status);
routes.get("/auth/debug", AuthenticationController.debug);

routes.post("/webhooks/store/redact", WebhookController.storeRedact);
routes.post("/webhooks/customers/redact", WebhookController.customersRedact);
routes.post(
  "/webhooks/customers/data_request",
  WebhookController.customersDataRequest
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
  requireServiceEnabledMiddleware,
  OrderController.getAll
);
apiRoutes.get(
  "/orders/:orderId",
  passport.authenticate("jwt", { session: false }),
  requireServiceEnabledMiddleware,
  OrderController.getOne
);

apiRoutes.get(
  "/shipments",
  passport.authenticate("jwt", { session: false }),
  requireServiceEnabledMiddleware,
  ShipmentController.getAll
);
apiRoutes.get(
  "/shipments/:shipmentId",
  passport.authenticate("jwt", { session: false }),
  requireServiceEnabledMiddleware,
  ShipmentController.getOne
);
apiRoutes.post(
  "/shipments",
  passport.authenticate("jwt", { session: false }),
  requireServiceEnabledMiddleware,
  ShipmentController.create
);
apiRoutes.get(
  "/shipments/:shipmentId/label",
  passport.authenticate("jwt", { session: false }),
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
