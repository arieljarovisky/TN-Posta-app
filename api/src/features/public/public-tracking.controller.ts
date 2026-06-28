import { NextFunction, Request, Response } from "express";

import { buildDeliveryPageHtml } from "@features/public/delivery-page";
import {
  buildPublicTrackingPayload,
} from "@features/public/tracking-data";
import { buildTrackingPageHtml } from "@features/public/tracking-page";
import { PUBLIC_SHIPPING_PAGE_PATH } from "@config/public-pages";
import TrackingService, {
  isValidTrackingCode,
  normalizeTrackingCode,
} from "@features/shipment/tracking.service";
import { isTrackingStatus } from "@features/shipment/interfaces/tracking.interface";
import { settingsRepository } from "@repository";
import { StatusCode } from "@utils";

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

      const storeSettings = settingsRepository.getByStoreId(shipment.store_id);

      if (!storeSettings.tracking_page_enabled) {
        return res.status(StatusCode.FORBIDDEN).json({
          message: "La pagina de seguimiento no esta activa para esta tienda",
        });
      }

      return res.status(StatusCode.OK).json({
        ...buildPublicTrackingPayload(shipment),
        statusSource: "manual",
      });
    } catch (error) {
      next(error);
    }
  }

  redirectLegacyTrackingPage(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Response | void {
    const trackingCode = req.params.trackingCode;
    const query = new URLSearchParams(req.query as Record<string, string>);

    if (trackingCode) {
      return res.redirect(
        301,
        `${PUBLIC_SHIPPING_PAGE_PATH}/${encodeURIComponent(trackingCode)}?${query.toString()}`
      );
    }

    const suffix = query.toString() ? `?${query.toString()}` : "";

    return res.redirect(301, `${PUBLIC_SHIPPING_PAGE_PATH}${suffix}`);
  }

  getTrackingPage(
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

      const isEmbed = req.query.embed === "1" || req.query.embed === "true";

      const renderPage = (options: Parameters<typeof buildTrackingPageHtml>[0]) =>
        res.send(buildTrackingPageHtml({ ...options, embed: isEmbed }));

      if (!trackingCode) {
        return renderPage({
          pageTitle: "Seguimiento de envio",
        });
      }

      if (!isValidTrackingCode(trackingCode)) {
        return renderPage({
          pageTitle: "Seguimiento de envio",
          codeInput: trackingCode,
          errorMessage:
            "No pudimos consultar el seguimiento. Intentá de nuevo en unos minutos.",
        });
      }

      const shipment = TrackingService.findByTrackingCode(trackingCode);

      if (!shipment) {
        return renderPage({
          pageTitle: "Seguimiento de envio",
          codeInput: trackingCode,
          errorMessage:
            "No pudimos consultar el seguimiento. Intentá de nuevo en unos minutos.",
        });
      }

      const storeSettings = settingsRepository.getByStoreId(shipment.store_id);
      const pageTitle =
        storeSettings.tracking_page_title?.trim() || "Seguimiento de envio";
      const storeName =
        storeSettings.sender?.business_name ??
        storeSettings.carrier_name ??
        "TN Posta";

      if (!storeSettings.tracking_page_enabled) {
        return renderPage({
          pageTitle,
          storeName,
          codeInput: trackingCode,
          disabledMessage:
            "El comercio aun no activo la consulta de seguimiento online. Contacta a la tienda si necesitas ayuda.",
        });
      }

      if (shipment.tracking_status === "cancelled") {
        return renderPage({
          pageTitle,
          storeName,
          codeInput: trackingCode,
          errorMessage: "Este envio fue cancelado.",
        });
      }

      return renderPage({
        pageTitle,
        storeName,
        codeInput: trackingCode,
        result: buildPublicTrackingPayload(shipment),
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
