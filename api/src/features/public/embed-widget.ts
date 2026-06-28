export const PUBLIC_EMBED_SCRIPT_PATH = "/embed/envio.js";

export const PUBLIC_ENVIO_API_PATH = "/api/public/envio";

const TRACKING_IFRAME_HEIGHT = 520;

const buildTrackingIframeSrc = (
  appOrigin: string,
  pagePath = "/consulta-envio"
): string => {
  const base = appOrigin ? `${appOrigin}${pagePath}` : pagePath;

  return `${base}?embed=1`;
};

/**
 * HTML para la API de paginas de Tiendanube.
 * No usar form/input: la tienda los elimina y deja el layout roto.
 * El iframe carga nuestra pagina /consulta-envio con estilos completos.
 */
export const buildTrackingPageApiContent = (
  appOrigin: string,
  pagePath = "/consulta-envio"
): string => {
  const iframeSrc = buildTrackingIframeSrc(appOrigin, pagePath);

  return `<div id="tn-posta-envio" style="max-width:560px;margin:24px auto"><iframe src="${iframeSrc}" title="Seguimiento de envio" width="100%" height="${TRACKING_IFRAME_HEIGHT}" style="width:100%;max-width:560px;height:${TRACKING_IFRAME_HEIGHT}px;border:0;border-radius:14px;background:transparent" loading="lazy"></iframe></div>`;
};

export const buildTrackingPageDisabledContent = (): string =>
  `<div style="max-width:560px;margin:24px auto;font-family:system-ui,-apple-system,sans-serif"><div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:28px 24px;text-align:center;font-size:15px;line-height:1.55;color:#6b7280">La consulta de seguimiento no est&aacute; disponible en este momento. Contact&aacute; a la tienda si necesit&aacute;s ayuda.</div></div>`;

/** Enlace de respaldo si iframe no es permitido en el editor manual. */
export const buildTrackingPageLinkFallback = (
  appOrigin: string,
  pagePath = "/consulta-envio"
): string => {
  const href = appOrigin ? `${appOrigin}${pagePath}` : pagePath;

  return `<div style="max-width:560px;margin:24px auto;font-family:system-ui,-apple-system,sans-serif;color:#111827"><div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 8px 28px rgba(17,24,39,.06);padding:28px 24px;text-align:center"><p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#374151">Ingres&aacute; tu c&oacute;digo de seguimiento TPA para conocer el estado de tu env&iacute;o.</p><a href="${href}" style="display:inline-block;padding:16px 28px;background:#111827;color:#fff;text-decoration:none;border-radius:10px;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase">Consultar env&iacute;o</a></div></div>`;
};

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

export const buildEmbedScript = (appOrigin: string): string => `(() => {
  const API = ${JSON.stringify(appOrigin)} + "/api/public/envio";
  const mount = document.getElementById("tn-posta-envio");
  if (!mount) return;

  const css = \`
    #tn-posta-envio{font-family:system-ui,-apple-system,sans-serif;color:#111827}
    #tn-posta-envio .tp-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 8px 28px rgba(17,24,39,.06);padding:28px 24px}
    #tn-posta-envio .tp-intro{margin:0 0 24px;text-align:center;font-size:15px;line-height:1.55;color:#374151}
    #tn-posta-envio .tp-label{display:block;margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#6b7280;text-align:center}
    #tn-posta-envio .tp-input{width:100%;padding:18px 16px;border:1px solid #d1d5db;border-radius:10px;font-size:22px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;text-align:center;box-sizing:border-box}
    #tn-posta-envio .tp-hint{margin:10px 0 18px;text-align:center;font-size:13px;color:#6b7280}
    #tn-posta-envio .tp-btn{width:100%;border:none;border-radius:10px;padding:16px;background:#111827;color:#fff;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
    #tn-posta-envio .tp-btn:disabled{opacity:.6;cursor:wait}
    #tn-posta-envio .tp-alert{margin-top:16px;padding:14px 16px;border-radius:10px;font-size:14px;line-height:1.45;background:#fff5f5;border:1px solid #fca5a5;color:#991b1b}
    #tn-posta-envio .tp-result{margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb}
    #tn-posta-envio .tp-status{display:inline-block;margin-top:6px;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:800;background:#f3f4f6}
    #tn-posta-envio .tp-code{font-size:20px;font-weight:900;letter-spacing:.1em;font-family:monospace;margin:6px 0 0}
    #tn-posta-envio .tp-meta{text-align:center;font-size:14px;color:#4b5563;margin:12px 0}
    #tn-posta-envio .tp-timeline{list-style:none;margin:16px 0 0;padding:0}
    #tn-posta-envio .tp-timeline li{padding:8px 0 8px 20px;border-left:2px solid #e5e7eb;margin-left:8px;font-size:14px}
    #tn-posta-envio .tp-timeline li.done{border-left-color:#111827;font-weight:600}
    #tn-posta-envio .tp-date{display:block;font-size:12px;color:#6b7280;font-weight:400}
  \`;

  const style = document.createElement("style");
  style.textContent = css;
  mount.appendChild(style);

  mount.insertAdjacentHTML("beforeend", \`
    <div class="tp-card">
      <p class="tp-intro">Ingresá tu código de seguimiento para conocer el estado de tu envío.</p>
      <form id="tp-form">
        <label class="tp-label" for="tp-code">Código de seguimiento</label>
        <input class="tp-input" id="tp-code" name="code" placeholder="TPA00100001" autocomplete="off" />
        <p class="tp-hint">El código figura en el mail de confirmación de envío.</p>
        <button class="tp-btn" type="submit">Consultar</button>
      </form>
      <div id="tp-out"></div>
    </div>\`);

  const form = mount.querySelector("#tp-form");
  const input = mount.querySelector("#tp-code");
  const out = mount.querySelector("#tp-out");
  const btn = form.querySelector(".tp-btn");

  const fmt = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("es-AR", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
    } catch { return ""; }
  };

  const renderResult = (data) => {
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
    out.innerHTML = \`<div class="tp-alert">\${msg}</div>\`;
  };

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const code = String(input.value || "").trim().toUpperCase();
    if (!code) return;
    btn.disabled = true;
    out.innerHTML = "";
    try {
      const res = await fetch(API + "?code=" + encodeURIComponent(code));
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(data.message || "No pudimos consultar el seguimiento. Intentá de nuevo en unos minutos.");
        return;
      }
      renderResult(data);
    } catch {
      showError("No pudimos consultar el seguimiento. Intentá de nuevo en unos minutos.");
    } finally {
      btn.disabled = false;
    }
  });
})();`;
