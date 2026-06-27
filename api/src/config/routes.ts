import { Router } from "express";
import passport from "passport";

import { AuthenticationController } from "@features/auth";
import { OrderController } from "@features/order";
import { ProductController } from "@features/product";
import { ShipmentController } from "@features/shipment";

const routes = Router();
routes.get("/auth/install", AuthenticationController.install);

routes.get(
  "/orders",
  passport.authenticate("jwt", { session: false }),
  OrderController.getAll
);
routes.get(
  "/orders/:orderId",
  passport.authenticate("jwt", { session: false }),
  OrderController.getOne
);

routes.get(
  "/shipments",
  passport.authenticate("jwt", { session: false }),
  ShipmentController.getAll
);
routes.get(
  "/shipments/:shipmentId",
  passport.authenticate("jwt", { session: false }),
  ShipmentController.getOne
);
routes.post(
  "/shipments",
  passport.authenticate("jwt", { session: false }),
  ShipmentController.create
);
routes.get(
  "/shipments/:shipmentId/label",
  passport.authenticate("jwt", { session: false }),
  ShipmentController.downloadLabel
);
routes.post(
  "/products",
  passport.authenticate("jwt", { session: false }),
  ProductController.create
);

routes.get(
  "/products/total",
  passport.authenticate("jwt", { session: false }),
  ProductController.getTotal
);
routes.get(
  "/products",
  passport.authenticate("jwt", { session: false }),
  ProductController.getAll
);
routes.delete(
  "/products/:id",
  passport.authenticate("jwt", { session: false }),
  ProductController.delete
);

export default routes;
