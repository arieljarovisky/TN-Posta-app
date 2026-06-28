import { DEFAULT_TRACKING_PAGE_HANDLE } from "@features/storefront/tracking-page.constants";

export const PUBLIC_STOREFRONT_SCRIPT_PATH = "/embed/storefront.js";

const TRACKING_IFRAME_HEIGHT = 520;

export const buildStorefrontTrackingScript = (
  appOrigin: string,
  pageHandle = DEFAULT_TRACKING_PAGE_HANDLE
): string => `(() => {
  const APP = ${JSON.stringify(appOrigin)};
  const HANDLE = ${JSON.stringify(pageHandle)};
  const IFRAME_HEIGHT = ${TRACKING_IFRAME_HEIGHT};
  const LS = window.LS;

  if (!LS || !LS.store || !LS.store.id) return;

  const path = String(window.location.pathname || "").toLowerCase();
  if (!path.includes("/" + HANDLE)) return;

  const mount =
    document.getElementById("tn-posta-envio") ||
    document.querySelector(".user-content .col-md-8") ||
    document.querySelector(".user-content");

  if (!mount) return;

  const renderIframe = (src) => {
    mount.innerHTML =
      '<iframe src="' +
      src +
      '" title="Seguimiento de envio" width="100%" height="' +
      IFRAME_HEIGHT +
      '" style="width:100%;max-width:560px;height:' +
      IFRAME_HEIGHT +
      'px;border:0;border-radius:14px;background:transparent" loading="lazy"></iframe>';
  };

  const renderDisabled = () => {
    mount.innerHTML =
      '<div style="max-width:560px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif">' +
      '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:28px 24px;text-align:center;font-size:15px;color:#6b7280">' +
      "La consulta de seguimiento no esta disponible en este momento." +
      "</div></div>";
  };

  fetch(APP + "/api/public/tienda/" + encodeURIComponent(String(LS.store.id)) + "/seguimiento")
    .then((res) => res.json())
    .then((cfg) => {
      if (!cfg || !cfg.enabled) {
        renderDisabled();
        return;
      }

      const pageUrl = cfg.pageUrl || APP + "/consulta-envio";
      const iframeSrc = pageUrl + (pageUrl.indexOf("?") >= 0 ? "&" : "?") + "embed=1";
      const existingFrame = mount.querySelector("iframe");

      if (existingFrame) {
        if (!existingFrame.getAttribute("src")) {
          existingFrame.setAttribute("src", iframeSrc);
        }
        return;
      }

      renderIframe(iframeSrc);
    })
    .catch(() => {});
})();`;
