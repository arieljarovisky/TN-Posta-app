/** CSS scoped bajo #tn-posta-envio (inyectado por JS en la tienda). */
export const TN_POSTA_TRACKING_STYLES = `
#tn-posta-envio{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#111827;max-width:520px;margin:24px auto}
#tn-posta-envio *{box-sizing:border-box}
#tn-posta-envio .tp-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 8px 28px rgba(17,24,39,.06);padding:28px 24px}
#tn-posta-envio .tp-intro{margin:0 0 24px;text-align:center;font-size:15px;line-height:1.55;color:#374151}
#tn-posta-envio .tp-label{display:block;margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#6b7280;text-align:center}
#tn-posta-envio .tp-input{display:block;width:100%;padding:18px 16px;border:1px solid #d1d5db;border-radius:10px;font-size:22px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;text-align:center;background:#fff;color:#111827;outline:none}
#tn-posta-envio .tp-input:focus{border-color:#111827;box-shadow:0 0 0 3px rgba(17,24,39,.08)}
#tn-posta-envio .tp-hint{margin:10px 0 18px;text-align:center;font-size:13px;line-height:1.45;color:#6b7280}
#tn-posta-envio .tp-btn{display:block;width:100%;border:none;border-radius:10px;padding:16px;background:#111827;color:#fff;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;text-align:center;text-decoration:none}
#tn-posta-envio .tp-btn:hover{background:#000}
#tn-posta-envio .tp-btn:disabled{opacity:.6;cursor:wait}
#tn-posta-envio .tp-alert{margin-top:16px;padding:14px 16px;border-radius:10px;font-size:14px;line-height:1.45;background:#fff5f5;border:1px solid #fca5a5;color:#991b1b}
#tn-posta-envio .tp-result{margin-top:24px;padding-top:24px;border-top:1px solid #e5e7eb}
#tn-posta-envio .tp-status{display:inline-block;margin-top:6px;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:800;background:#f3f4f6}
#tn-posta-envio .tp-code{font-size:20px;font-weight:900;letter-spacing:.1em;font-family:ui-monospace,monospace;margin:6px 0 0}
#tn-posta-envio .tp-meta{text-align:center;font-size:14px;color:#4b5563;margin:12px 0}
#tn-posta-envio .tp-timeline{list-style:none;margin:16px 0 0;padding:0}
#tn-posta-envio .tp-timeline li{padding:8px 0 8px 20px;border-left:2px solid #e5e7eb;margin-left:8px;font-size:14px}
#tn-posta-envio .tp-timeline li.done{border-left-color:#111827;font-weight:600}
#tn-posta-envio .tp-date{display:block;font-size:12px;color:#6b7280;font-weight:400}
#tn-posta-envio .tp-disabled{text-align:center;font-size:15px;line-height:1.55;color:#6b7280;padding:8px 0}
`.trim();

export const buildTrackingWidgetMarkup = (actionUrl: string): string => `
<div class="tp-card">
  <p class="tp-intro">Ingres&aacute; tu c&oacute;digo de seguimiento TPA para conocer el estado de tu env&iacute;o.</p>
  <form id="tp-form" action="${actionUrl}" method="get">
    <label class="tp-label" for="tn-posta-code">C&oacute;digo de seguimiento</label>
    <input class="tp-input" id="tn-posta-code" name="code" required placeholder="TPA00100001" autocomplete="off" />
    <p class="tp-hint">El c&oacute;digo figura en el mail de confirmaci&oacute;n de env&iacute;o.</p>
    <button class="tp-btn" type="submit">Consultar</button>
  </form>
  <div class="tp-out"></div>
</div>`;

/**
 * HTML que Tiendanube no rompe: solo div/p/a con estilos inline.
 * Funciona sin JavaScript (redirige a /consulta-envio).
 */
export const buildTrackingPageFallbackContent = (
  appOrigin: string,
  pagePath = "/consulta-envio"
): string => {
  const href = appOrigin ? `${appOrigin}${pagePath}` : pagePath;

  return `<div id="tn-posta-envio" style="max-width:520px;margin:24px auto;font-family:system-ui,-apple-system,sans-serif;color:#111827"><div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 8px 28px rgba(17,24,39,.06);padding:28px 24px;text-align:center"><p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#374151">Ingres&aacute; tu c&oacute;digo de seguimiento TPA para conocer el estado de tu env&iacute;o.</p><a href="${href}" style="display:block;padding:16px;background:#111827;color:#fff;text-decoration:none;border-radius:10px;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase">Consultar env&iacute;o</a><p style="margin:14px 0 0;font-size:13px;line-height:1.45;color:#6b7280">El c&oacute;digo figura en el mail de confirmaci&oacute;n de env&iacute;o.</p></div></div>`;
};

export const buildTrackingPageDisabledContent = (): string =>
  `<div id="tn-posta-envio" style="max-width:520px;margin:24px auto;font-family:system-ui,-apple-system,sans-serif"><div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:28px 24px;text-align:center;font-size:15px;line-height:1.55;color:#6b7280">La consulta de seguimiento no est&aacute; disponible en este momento. Contact&aacute; a la tienda si necesit&aacute;s ayuda.</div></div>`;
