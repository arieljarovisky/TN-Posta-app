import { DEFAULT_TRACKING_PAGE_HANDLE } from "@features/storefront/tracking-page.constants";
import {
  buildTrackingWidgetMarkup,
  TN_POSTA_FULL_STYLES,
} from "@features/public/tracking-widget-styles";

export const PUBLIC_STOREFRONT_SCRIPT_PATH = "/embed/storefront.js";

export const buildStorefrontTrackingScript = (
  appOrigin: string,
  pageHandle = DEFAULT_TRACKING_PAGE_HANDLE
): string => {
  const action = `${appOrigin.replace(/\/$/, "")}/consulta-envio`;
  const widgetMarkup = buildTrackingWidgetMarkup(action);

  return `(() => {
  const APP = ${JSON.stringify(appOrigin)};
  const HANDLE = ${JSON.stringify(pageHandle)};
  const CSS = ${JSON.stringify(TN_POSTA_FULL_STYLES)};
  const WIDGET = ${JSON.stringify(widgetMarkup)};
  const LS = window.LS;

  const path = String(window.location.pathname || "").toLowerCase();
  const onTrackingPage = path.includes("/" + HANDLE) || Boolean(document.getElementById("tn-posta-envio"));

  if (!onTrackingPage) return;

  const mount =
    document.getElementById("tn-posta-envio") ||
    document.querySelector(".user-content .col-md-8") ||
    document.querySelector(".user-content");

  if (!mount) return;

  const renderWidget = (apiUrl) => {
    mount.innerHTML = "<style>" + CSS + "</style>" + WIDGET;

    const form = mount.querySelector("#tp-form");
    const input = mount.querySelector("#tn-posta-code");
    const out = mount.querySelector(".tp-out");
    const btn = form && form.querySelector(".tp-btn");

    if (!form || !input) return;

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const code = String(input.value || "").trim().toUpperCase();
      if (!code) return;
      if (btn) btn.disabled = true;
      if (out) out.innerHTML = "";

      const fmt = (iso) => {
        if (!iso) return "";
        try {
          return new Date(iso).toLocaleString("es-AR", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
        } catch { return ""; }
      };

      try {
        const res = await fetch(apiUrl + "?code=" + encodeURIComponent(code));
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (out) {
            out.innerHTML = '<div class="tp-alert">' + (data.message || "No pudimos consultar el seguimiento. Intenta de nuevo en unos minutos.") + '</div>';
          }
          return;
        }

        if (out) {
          const events = (data.events || []).map((e) =>
            '<li class="' + (e.done ? "done" : "") + '">' + e.label +
            (e.at ? '<span class="tp-date">' + fmt(e.at) + '</span>' : "") + '</li>'
          ).join("");
          out.innerHTML =
            '<div class="tp-result">' +
            '<div style="text-align:center"><span class="tp-status">' + (data.statusLabel || "") + '</span>' +
            '<div class="tp-code">' + (data.trackingCode || "") + '</div></div>' +
            '<div class="tp-meta"><p>Pedido <strong>#' + (data.orderNumber || "") + '</strong></p>' +
            '<p>Destino <strong>' + (data.destinationCity || "") + '</strong></p></div>' +
            '<ol class="tp-timeline">' + events + '</ol></div>';
        }
      } catch {
        window.location.href = form.action + (form.action.indexOf("?") >= 0 ? "&" : "?") + "code=" + encodeURIComponent(code);
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  };

  const renderDisabled = () => {
    mount.innerHTML =
      '<div style="max-width:520px;margin:0 auto;font-family:system-ui,sans-serif">' +
      '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:28px 24px;text-align:center;font-size:15px;color:#6b7280">' +
      "La consulta de seguimiento no esta disponible en este momento." +
      "</div></div>";
  };

  const defaultApi = APP + "/api/public/envio";
  const storeId = LS && LS.store && LS.store.id ? String(LS.store.id) : null;

  if (!storeId) {
    renderWidget(defaultApi);
    return;
  }

  fetch(APP + "/api/public/tienda/" + encodeURIComponent(storeId) + "/seguimiento")
    .then((res) => res.json())
    .then((cfg) => {
      if (!cfg || cfg.enabled === false) {
        renderDisabled();
        return;
      }

      renderWidget(cfg.apiUrl || defaultApi);
    })
    .catch(() => {
      renderWidget(defaultApi);
    });
})();`;
};
