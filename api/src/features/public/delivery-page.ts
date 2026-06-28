const escHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export type DeliveryPagePhase =
  | "ready_to_start"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "invalid"
  | "not_found";

export const buildDeliveryPageHtml = (opts: {
  trackingCode: string;
  orderNumber: string;
  destinationCity: string | null;
  customerName: string | null;
  phase: DeliveryPagePhase;
  statusLabel?: string | null;
  postUrl: string;
}): string => {
  const {
    trackingCode,
    orderNumber,
    destinationCity,
    customerName,
    phase,
    statusLabel,
    postUrl,
  } = opts;

  const title =
    phase === "delivered"
      ? "Entrega confirmada"
      : phase === "in_transit"
        ? "Confirmar entrega"
        : phase === "ready_to_start"
          ? "Iniciar viaje"
          : phase === "cancelled"
            ? "Pedido cancelado"
            : "Codigo no valido";

  const bodyContent =
    phase === "delivered"
      ? `<div class="icon ok">✓</div>
         <p class="lead">El envio <strong>${escHtml(trackingCode)}</strong> ya esta marcado como entregado.</p>`
      : phase === "cancelled"
        ? `<div class="icon warn">!</div>
           <p class="lead">Este pedido fue cancelado y no puede gestionarse desde el QR.</p>`
        : phase === "not_found" || phase === "invalid"
          ? `<div class="icon warn">?</div>
             <p class="lead">No encontramos un envio con ese codigo. Verifica que el QR sea de una etiqueta TN Posta valida.</p>`
          : `<p class="lead">Pedido <strong>#${escHtml(orderNumber)}</strong></p>
             ${customerName ? `<p class="meta">${escHtml(customerName)}</p>` : ""}
             ${destinationCity ? `<p class="meta">${escHtml(destinationCity)}</p>` : ""}
             <p class="code">${escHtml(trackingCode)}</p>
             ${statusLabel ? `<p class="status-pill">${escHtml(statusLabel)}</p>` : ""}
             ${
               phase === "ready_to_start"
                 ? `<button type="button" class="btn btn-start" id="actionBtn" data-action="start">Iniciar viaje</button>
                    <p class="hint" id="hint">Al salir del deposito, inicia el viaje para avisar al cliente que el pedido esta en camino.</p>`
                 : `<button type="button" class="btn btn-deliver" id="actionBtn" data-action="deliver">Confirmar entrega</button>
                    <p class="hint" id="hint">Al entregar el paquete al cliente, confirma para cerrar el envio.</p>`
             }
             <div class="result" id="result" hidden></div>`;

  const script =
    phase === "ready_to_start" || phase === "in_transit"
      ? `<script>
(function () {
  var btn = document.getElementById('actionBtn');
  var hint = document.getElementById('hint');
  var result = document.getElementById('result');
  if (!btn) return;
  var defaultLabel = btn.textContent;
  btn.addEventListener('click', function () {
    var action = btn.getAttribute('data-action') || 'deliver';
    btn.disabled = true;
    btn.textContent = action === 'start' ? 'Iniciando…' : 'Confirmando…';
    hint.textContent = '';
    fetch(${JSON.stringify(postUrl)}, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: action })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.data && res.data.message ? res.data.message : 'No se pudo completar la accion');
        result.hidden = false;
        result.className = 'result ok';
        if (action === 'start') {
          result.innerHTML = '<strong>✓ Viaje iniciado</strong><br/>El pedido figura en camino. Volve a escanear al entregar.';
          btn.setAttribute('data-action', 'deliver');
          btn.textContent = 'Confirmar entrega';
          btn.className = 'btn btn-deliver';
          btn.disabled = false;
          var pill = document.querySelector('.status-pill');
          if (pill) pill.textContent = 'En camino';
          document.title = 'En camino';
          hint.textContent = 'Cuando entregues el paquete, toca confirmar entrega.';
          hint.style.color = '#64748b';
        } else {
          result.innerHTML = '<strong>✓ Entrega confirmada</strong><br/>El envio quedo cerrado correctamente.';
          btn.style.display = 'none';
          document.title = 'Entrega confirmada';
        }
      })
      .catch(function (err) {
        btn.disabled = false;
        btn.textContent = defaultLabel;
        hint.textContent = err.message || 'Error. Intenta de nuevo.';
        hint.style.color = '#fca5a5';
      });
  });
})();
</script>`
      : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${escHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
      color: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .card {
      width: 100%; max-width: 400px; background: rgba(15,23,42,0.92); border: 1px solid rgba(148,163,184,0.25);
      border-radius: 20px; padding: 24px 20px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.35);
    }
    .brand { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; }
    h1 { margin: 0 0 16px; font-size: 22px; font-weight: 800; }
    .lead { margin: 0 0 8px; font-size: 16px; line-height: 1.45; color: #e2e8f0; }
    .meta { margin: 4px 0; font-size: 14px; color: #94a3b8; }
    .code { margin: 14px 0 10px; font-family: ui-monospace, monospace; font-size: 18px; font-weight: 800; letter-spacing: 0.08em; color: #67e8f9; }
    .status-pill {
      display: inline-block; margin: 0 0 16px; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700;
      background: rgba(56,189,248,0.15); color: #7dd3fc; border: 1px solid rgba(56,189,248,0.35);
    }
    .btn {
      width: 100%; border: none; border-radius: 14px; padding: 16px 20px; font-size: 17px; font-weight: 800;
      color: #fff; cursor: pointer;
    }
    .btn-start {
      background: linear-gradient(135deg, #0284c7, #0ea5e9);
      box-shadow: 0 8px 24px rgba(14,165,233,0.35);
    }
    .btn-deliver {
      background: linear-gradient(135deg, #059669, #10b981);
      box-shadow: 0 8px 24px rgba(16,185,129,0.35);
    }
    .btn:disabled { opacity: 0.65; cursor: wait; }
    .hint { margin: 12px 0 0; font-size: 12px; color: #64748b; line-height: 1.4; }
    .icon { width: 56px; height: 56px; margin: 0 auto 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 900; }
    .icon.ok { background: rgba(16,185,129,0.2); color: #34d399; }
    .icon.warn { background: rgba(245,158,11,0.2); color: #fbbf24; }
    .result { margin-top: 16px; padding: 12px; border-radius: 12px; font-size: 14px; line-height: 1.45; }
    .result.ok { background: rgba(16,185,129,0.15); border: 1px solid rgba(52,211,153,0.35); color: #a7f3d0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">TN Posta</div>
    <h1>${escHtml(title)}</h1>
    ${bodyContent}
  </div>
  ${script}
</body>
</html>`;
};
