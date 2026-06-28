import { NextFunction, Request, Response } from "express";

import { buildDeliveryPageHtml } from "@features/public/delivery-page";
import TrackingService, {
  isValidTrackingCode,
  normalizeTrackingCode,
} from "@features/shipment/tracking.service";
import { isTrackingStatus } from "@features/shipment/interfaces/tracking.interface";
import { StatusCode } from "@utils";

const buildTrackingEvents = (shipment: {
  created_at: string;
  label_generated_at?: string;
  tracking_status?: string;
  tracking_status_updated_at?: string;
}) => {
  const status = isTrackingStatus(shipment.tracking_status)
    ? shipment.tracking_status
    : "preparing";

  return [
    {
      key: "created",
      label: "Pedido registrado",
      at: shipment.created_at,
      done: true,
    },
    {
      key: "tracking",
      label: "Codigo de seguimiento generado",
      at: shipment.label_generated_at ?? null,
      done: Boolean(shipment.label_generated_at),
    },
    {
      key: "preparing",
      label: "En preparacion",
      at:
        status === "preparing" ? shipment.tracking_status_updated_at ?? null : null,
      done: ["preparing", "shipped", "delivered"].includes(status),
    },
    {
      key: "shipped",
      label: "En camino",
      at: status === "shipped" || status === "delivered"
        ? shipment.tracking_status_updated_at ?? null
        : null,
      done: ["shipped", "delivered"].includes(status),
    },
    {
      key: "delivered",
      label: "Entregado",
      at: status === "delivered" ? shipment.tracking_status_updated_at ?? null : null,
      done: status === "delivered",
    },
  ];
};

class PublicTrackingController {
  getTracking(
    req: Request,
    res: Response,
    next: NextFunction
  ): Response | void {
    try {
      const trackingCode = normalizeTrackingCode(
        (req.params.trackingCode as string | undefined) ??
          (req.query.code as string | undefined) ??
          ""
      );

      if (!trackingCode) {
        return res
          .status(StatusCode.BAD_REQUEST)
          .json({ message: "Ingresa un codigo de seguimiento" });
      }

      if (!isValidTrackingCode(trackingCode)) {
        return res
          .status(StatusCode.BAD_REQUEST)
          .json({ message: "Codigo de seguimiento invalido" });
      }

      const shipment = TrackingService.findByTrackingCode(trackingCode);

      if (!shipment) {
        return res
          .status(StatusCode.NOT_FOUND)
          .json({ message: "No encontramos ese codigo de seguimiento" });
      }

      const status = isTrackingStatus(shipment.tracking_status)
        ? shipment.tracking_status
        : "preparing";

      return res.status(StatusCode.OK).json({
        trackingCode: shipment.tracking_code,
        orderNumber: shipment.order_number,
        status,
        statusLabel: TrackingService.getStatusLabel(status),
        statusSource: "manual",
        destinationCity: `${shipment.destination.city}, ${shipment.destination.province}`,
        customerName: shipment.recipient.name,
        events: buildTrackingEvents(shipment),
      });
    } catch (error) {
      next(error);
    }
  }

  getDeliveryPage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Response | void {
    try {
      const trackingCode = normalizeTrackingCode(req.params.trackingCode);
      const postUrl = `/api/public/entrega/${encodeURIComponent(trackingCode)}`;

      if (!trackingCode) {
        return res
          .status(StatusCode.BAD_REQUEST)
          .send(
            buildDeliveryPageHtml({
              trackingCode: "",
              orderNumber: "",
              destinationCity: null,
              customerName: null,
              phase: "invalid",
              postUrl,
            })
          );
      }

      if (!isValidTrackingCode(trackingCode)) {
        return res
          .status(StatusCode.BAD_REQUEST)
          .send(
            buildDeliveryPageHtml({
              trackingCode,
              orderNumber: "",
              destinationCity: null,
              customerName: null,
              phase: "invalid",
              postUrl,
            })
          );
      }

      const shipment = TrackingService.findByTrackingCode(trackingCode);

      if (!shipment?.tracking_code) {
        return res
          .status(StatusCode.NOT_FOUND)
          .send(
            buildDeliveryPageHtml({
              trackingCode,
              orderNumber: "",
              destinationCity: null,
              customerName: null,
              phase: "not_found",
              postUrl,
            })
          );
      }

      const status = isTrackingStatus(shipment.tracking_status)
        ? shipment.tracking_status
        : "preparing";

      if (status === "cancelled") {
        return res
          .status(StatusCode.BAD_REQUEST)
          .send(
            buildDeliveryPageHtml({
              trackingCode: shipment.tracking_code,
              orderNumber: String(shipment.order_number),
              destinationCity: null,
              customerName: null,
              phase: "cancelled",
              postUrl,
            })
          );
      }

      if (status === "delivered") {
        return res.send(
          buildDeliveryPageHtml({
            trackingCode: shipment.tracking_code,
            orderNumber: String(shipment.order_number),
            destinationCity: `${shipment.destination.city}, ${shipment.destination.province}`,
            customerName: shipment.recipient.name,
            phase: "delivered",
            postUrl,
          })
        );
      }

      const phase = status === "shipped" ? "in_transit" : "ready_to_start";

      return res.send(
        buildDeliveryPageHtml({
          trackingCode: shipment.tracking_code,
          orderNumber: String(shipment.order_number),
          destinationCity: `${shipment.destination.city}, ${shipment.destination.province}`,
          customerName: shipment.recipient.name,
          phase,
          statusLabel: TrackingService.getStatusLabel(status),
          postUrl,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  confirmDelivery(
    req: Request,
    res: Response,
    next: NextFunction
  ): Response | void {
    try {
      const trackingCode = normalizeTrackingCode(req.params.trackingCode);
      const action = String(req.body?.action ?? "deliver").toLowerCase();

      if (!trackingCode) {
        return res
          .status(StatusCode.BAD_REQUEST)
          .json({ message: "Codigo de seguimiento requerido" });
      }

      if (action !== "start" && action !== "deliver") {
        return res
          .status(StatusCode.BAD_REQUEST)
          .json({ message: 'Accion invalida. Usa "start" o "deliver".' });
      }

      if (action === "start") {
        const result = TrackingService.startTrip(trackingCode);

        if (!result.ok) {
          const messages: Record<string, string> = {
            not_found: "No encontramos ese codigo de seguimiento",
            cancelled: "Este pedido esta cancelado",
            already_delivered: "Este envio ya fue entregado",
          };

          return res.status(
            result.reason === "not_found"
              ? StatusCode.NOT_FOUND
              : StatusCode.BAD_REQUEST
          ).json({
            message: messages[result.reason ?? ""] ?? "No se pudo iniciar el viaje",
          });
        }

        return res.status(StatusCode.OK).json({
          ok: true,
          action: "start",
          alreadyStarted: result.alreadyStarted,
          trackingCode: result.shipment?.tracking_code,
          orderNumber: result.shipment?.order_number,
          status: "shipped",
          statusLabel: TrackingService.getStatusLabel("shipped"),
        });
      }

      const result = TrackingService.confirmDelivery(trackingCode);

      if (!result.ok) {
        const messages: Record<string, string> = {
          not_found: "No encontramos ese codigo de seguimiento",
          cancelled: "Este pedido esta cancelado",
          not_shipped: "Primero inicia el viaje antes de confirmar la entrega",
        };

        return res.status(
          result.reason === "not_found"
            ? StatusCode.NOT_FOUND
            : StatusCode.BAD_REQUEST
        ).json({
          message:
            messages[result.reason ?? ""] ?? "No se pudo confirmar la entrega",
        });
      }

      return res.status(StatusCode.OK).json({
        ok: true,
        action: "deliver",
        alreadyDelivered: result.alreadyDelivered,
        trackingCode: result.shipment?.tracking_code,
        orderNumber: result.shipment?.order_number,
        status: "delivered",
        statusLabel: TrackingService.getStatusLabel("delivered"),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PublicTrackingController();
