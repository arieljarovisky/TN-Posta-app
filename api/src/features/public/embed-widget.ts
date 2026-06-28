import {
  buildTrackingWidgetMarkup,
  TN_POSTA_TRACKING_STYLES,
} from "@features/public/tracking-widget-styles";

export const PUBLIC_EMBED_SCRIPT_PATH = "/embed/envio.js";

export const PUBLIC_ENVIO_API_PATH = "/api/public/envio";

export { TN_POSTA_TRACKING_STYLES, buildTrackingWidgetMarkup };

/** HTML inline con CSS embebido para la API de paginas de Tiendanube (sin iframe). */
export const buildTrackingPageApiContent = (
  appOrigin: string,
  pagePath = "/consulta-envio"
): string => {
  const action = appOrigin ? `${appOrigin}${pagePath}` : pagePath;

  return `<div id="tn-posta-envio"><style>${TN_POSTA_TRACKING_STYLES}</style>${buildTrackingWidgetMarkup(action)}</div>`;
};

export const buildTrackingPageDisabledContent = (): string =>
  `<div id="tn-posta-envio"><style>${TN_POSTA_TRACKING_STYLES}</style><div class="tp-card"><p class="tp-disabled">La consulta de seguimiento no est&aacute; disponible en este momento. Contact&aacute; a la tienda si necesit&aacute;s ayuda.</p></div></div>`;

/** HTML para pegar manualmente en el editor de Tiendanube. */
export const buildEmbedFormHtmlSnippet = (
  appOrigin: string,
  pagePath = "/consulta-envio"
): string => buildTrackingPageApiContent(appOrigin, pagePath);

/** Requiere script externo; Tiendanube suele eliminarlo al guardar. */
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

  const css = ${JSON.stringify(TN_POSTA_TRACKING_STYLES)};

  if (!mount.querySelector("style")) {
    const style = document.createElement("style");
    style.textContent = css;
    mount.insertBefore(style, mount.firstChild);
  }

  if (!mount.querySelector("#tp-form")) {
    mount.insertAdjacentHTML("beforeend", ${JSON.stringify(widgetMarkup)});
  }

  const form = mount.querySelector("#tp-form");
  const input = mount.querySelector("#tn-posta-code") || mount.querySelector("#tp-code");
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
      showError("No pudimos consultar el seguimiento. Intenta de nuevo en unos minutos.");
    } finally {
      if (btn) btn.disabled = false;
    }
  });
})();`;
};
