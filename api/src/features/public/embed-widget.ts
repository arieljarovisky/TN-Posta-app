import {
  buildTrackingPageFallbackContent,
  buildTrackingWidgetMarkup,
  TN_POSTA_FULL_STYLES,
} from "@features/public/tracking-widget-styles";

export const PUBLIC_EMBED_SCRIPT_PATH = "/embed/envio.js";

export const PUBLIC_ENVIO_API_PATH = "/api/public/envio";

export {
  TN_POSTA_FULL_STYLES,
  TN_POSTA_TRACKING_STYLES,
  buildTrackingWidgetMarkup,
  buildTrackingPageFallbackContent,
  getTrackingThemeCssSnippet,
} from "@features/public/tracking-widget-styles";

/** HTML publicado en Tiendanube: enlace estilizado que siempre funciona. El script de storefront reemplaza esto con el formulario. */
export const buildTrackingPageApiContent = (
  appOrigin: string,
  pagePath = "/consulta-envio"
): string => buildTrackingPageFallbackContent(appOrigin, pagePath);

export { buildTrackingPageDisabledContent } from "@features/public/tracking-widget-styles";

/** HTML para pegar manualmente en el editor de Tiendanube. */
export const buildEmbedFormHtmlSnippet = (
  appOrigin: string,
  pagePath = "/consulta-envio"
): string => buildTrackingPageApiContent(appOrigin, pagePath);

export const buildEmbedScriptHtmlSnippet = (appOrigin: string): string =>
  `<div id="tn-posta-envio"></div>
<script src="${appOrigin}${PUBLIC_EMBED_SCRIPT_PATH}" defer></script>`;

export const buildEmbedHtmlSnippet = buildEmbedFormHtmlSnippet;

export const buildEmbedScript = (appOrigin: string): string => {
  const action = `${appOrigin.replace(/\/$/, "")}/consulta-envio`;
  const widgetMarkup = buildTrackingWidgetMarkup(action);

  return `(() => {
  const API = ${JSON.stringify(appOrigin)} + "/api/public/envio";
  const mount = document.getElementById("tn-posta-envio");
  if (!mount) return;

  const css = ${JSON.stringify(TN_POSTA_FULL_STYLES)};

  mount.innerHTML = "<style>" + css + "</style>" + ${JSON.stringify(widgetMarkup)};

  const form = mount.querySelector("#tp-form");
  const input = mount.querySelector("#tn-posta-code");
  const out = mount.querySelector(".tp-out");
  const btn = form && form.querySelector(".tp-btn");

  if (!form || !input) return;

  const fmt = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("es-AR", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
    } catch { return ""; }
  };

  const renderResult = (data) => {
    if (!out) return;
    const events = (data.events || []).map((e) =>
      \`<li class="\${e.done ? "done" : ""}">\${e.label}\${e.at ? \`<span class="tp-date">\${fmt(e.at)}</span>\` : ""}</li>\`
    ).join("");
    out.innerHTML = \`
      <div class="tp-result">
        <div style="text-align:center">
          <span class="tp-status">\${data.statusLabel || ""}</span>
          <div class="tp-code">\${data.trackingCode || ""}</div>
        </div>
        <div class="tp-meta">
          <p>Pedido <strong>#\${data.orderNumber || ""}</strong></p>
          <p>Destino <strong>\${data.destinationCity || ""}</strong></p>
        </div>
        <ol class="tp-timeline">\${events}</ol>
      </div>\`;
  };

  const showError = (msg) => {
    if (!out) return;
    out.innerHTML = \`<div class="tp-alert">\${msg}</div>\`;
  };

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const code = String(input.value || "").trim().toUpperCase();
    if (!code) return;
    if (btn) btn.disabled = true;
    if (out) out.innerHTML = "";
    try {
      const res = await fetch(API + "?code=" + encodeURIComponent(code));
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(data.message || "No pudimos consultar el seguimiento. Intenta de nuevo en unos minutos.");
        return;
      }
      renderResult(data);
    } catch {
      window.location.href = form.action + (form.action.indexOf("?") >= 0 ? "&" : "?") + "code=" + encodeURIComponent(code);
    } finally {
      if (btn) btn.disabled = false;
    }
  });
})();`;
};
