import { Router } from "express";
import passport from "passport";

import { AuthenticationController } from "@features/auth";
import { OrderController } from "@features/order";
import { ProductController } from "@features/product";
import { ShipmentController } from "@features/shipment";

const routes = Router();
const apiRoutes = Router();

routes.get("/auth/install", AuthenticationController.install);

apiRoutes.get(
  "/orders",
  passport.authenticate("jwt", { session: false }),
  OrderController.getAll
);
apiRoutes.get(
  "/orders/:orderId",
  passport.authenticate("jwt", { session: false }),
  OrderController.getOne
);

apiRoutes.get(
  "/shipments",
  passport.authenticate("jwt", { session: false }),
  ShipmentController.getAll
);
apiRoutes.get(
  "/shipments/:shipmentId",
  passport.authenticate("jwt", { session: false }),
  ShipmentController.getOne
);
apiRoutes.post(
  "/shipments",
  passport.authenticate("jwt", { session: false }),
  ShipmentController.create
);
apiRoutes.get(
  "/shipments/:shipmentId/label",
  passport.authenticate("jwt", { session: false }),
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
