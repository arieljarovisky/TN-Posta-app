import { DEFAULT_TRACKING_PAGE_HANDLE } from "@features/storefront/tracking-page.constants";

export const PUBLIC_STOREFRONT_SCRIPT_PATH = "/embed/storefront.js";

export const buildStorefrontTrackingScript = (
  appOrigin: string,
  pageHandle = DEFAULT_TRACKING_PAGE_HANDLE
): string => `(() => {
  const APP = ${JSON.stringify(appOrigin)};
  const HANDLE = ${JSON.stringify(pageHandle)};
  const LS = window.LS;

  if (!LS || !LS.store || !LS.store.id) return;

  const path = String(window.location.pathname || "").toLowerCase();
  if (!path.includes("/" + HANDLE)) return;

  const mount =
    document.getElementById("tn-posta-envio") ||
    document.querySelector(".user-content .col-md-8") ||
    document.querySelector(".user-content");

  if (!mount) return;

  fetch(APP + "/api/public/tienda/" + encodeURIComponent(String(LS.store.id)) + "/seguimiento")
    .then((res) => res.json())
    .then((cfg) => {
      if (!cfg || !cfg.enabled) {
        mount.innerHTML = '<div style="max-width:520px;margin:24px auto"><div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:28px 24px;text-align:center;font-size:15px;color:#6b7280">La consulta de seguimiento no esta disponible en este momento.</div></div>';
        return;
      }

      const css = \`
        #tn-posta-envio .tp-out{margin-top:16px}
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

      let form = mount.querySelector("form");
      let input = mount.querySelector('input[name="code"]');
      let btn = mount.querySelector('button[type="submit"]');

      if (!form) {
        mount.innerHTML = \`
          <style>\${css}</style>
          <div style="max-width:520px;margin:24px auto;font-family:system-ui,-apple-system,sans-serif;color:#111827">
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 8px 28px rgba(17,24,39,.06);padding:28px 24px">
              <p style="margin:0 0 24px;text-align:center;font-size:15px;line-height:1.55;color:#374151">Ingresa tu codigo de seguimiento para conocer el estado de tu envio.</p>
              <form id="tp-form">
                <label style="display:block;margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#6b7280;text-align:center" for="tp-code">Codigo de seguimiento</label>
                <input id="tp-code" name="code" placeholder="TPA00100001" autocomplete="off" style="width:100%;padding:18px 16px;border:1px solid #d1d5db;border-radius:10px;font-size:22px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;text-align:center;box-sizing:border-box" />
                <p style="margin:10px 0 18px;text-align:center;font-size:13px;color:#6b7280">El codigo figura en el mail de confirmacion de envio.</p>
                <button type="submit" style="width:100%;border:none;border-radius:10px;padding:16px;background:#111827;color:#fff;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;cursor:pointer">Consultar</button>
              </form>
              <div class="tp-out"></div>
            </div>
          </div>\`;
        form = mount.querySelector("form");
        input = mount.querySelector('input[name="code"]');
        btn = mount.querySelector('button[type="submit"]');
      } else if (!mount.querySelector("style")) {
        mount.insertAdjacentHTML("afterbegin", "<style>" + css + "</style>");
        if (!mount.querySelector(".tp-out")) {
          form.insertAdjacentHTML("afterend", '<div class="tp-out"></div>');
        }
      }

      const out = mount.querySelector(".tp-out");
      const api = cfg.apiUrl || APP + "/api/public/envio";

      const fmt = (iso) => {
        if (!iso) return "";
        try {
          return new Date(iso).toLocaleString("es-AR", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
        } catch { return ""; }
      };

      const showError = (msg) => {
        if (!out) return;
        out.innerHTML = \`<div class="tp-alert">\${msg}</div>\`;
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

      form.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const code = String(input.value || "").trim().toUpperCase();
        if (!code) return;
        if (btn) btn.disabled = true;
        if (out) out.innerHTML = "";
        try {
          const res = await fetch(api + "?code=" + encodeURIComponent(code));
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
    })
    .catch(() => {});
})();`;
