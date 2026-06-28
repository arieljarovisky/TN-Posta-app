import { PublicTrackingPayload } from "@features/public/tracking-data";

const escHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatDate = (value: string | null): string => {
  if (!value) {
    return "";
  }

  try {
    return new Date(value).toLocaleString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

const statusClass = (status: string): string => {
  switch (status) {
    case "delivered":
      return "status-delivered";
    case "shipped":
      return "status-shipped";
    case "cancelled":
      return "status-cancelled";
    default:
      return "status-preparing";
  }
};

const renderAlert = (
  message: string,
  variant: "error" | "warning" = "error"
): string => `
  <div class="alert alert-${variant}" role="alert">
    <span class="alert-icon" aria-hidden="true">${variant === "error" ? "!" : "i"}</span>
    <span class="alert-text">${escHtml(message)}</span>
  </div>`;

const renderTimeline = (events: PublicTrackingPayload["events"]): string =>
  events
    .map(
      (event) => `
      <li class="timeline-item ${event.done ? "done" : "pending"}">
        <span class="timeline-dot" aria-hidden="true"></span>
        <div class="timeline-content">
          <strong>${escHtml(event.label)}</strong>
          ${event.at ? `<span class="timeline-date">${escHtml(formatDate(event.at))}</span>` : ""}
        </div>
      </li>`
    )
    .join("");

const renderResult = (result: PublicTrackingPayload): string => `
  <section class="result-block">
    <div class="result-top">
      <div>
        <p class="field-label">Estado actual</p>
        <span class="status-pill ${statusClass(result.status)}">${escHtml(result.statusLabel)}</span>
      </div>
      <div class="result-code-wrap">
        <p class="field-label">Codigo</p>
        <p class="result-code">${escHtml(result.trackingCode)}</p>
      </div>
    </div>
    <div class="result-meta">
      <p>Pedido <strong>#${escHtml(result.orderNumber)}</strong></p>
      <p>Destino <strong>${escHtml(result.destinationCity)}</strong></p>
    </div>
    <ol class="timeline">${renderTimeline(result.events)}</ol>
  </section>`;

export type TrackingPageOptions = {
  pageTitle: string;
  storeName?: string;
  codeInput?: string;
  errorMessage?: string | null;
  disabledMessage?: string | null;
  result?: PublicTrackingPayload | null;
  embed?: boolean;
};

export const buildTrackingPageHtml = (options: TrackingPageOptions): string => {
  const {
    storeName = "TN Posta",
    codeInput = "",
    errorMessage = null,
    disabledMessage = null,
    result = null,
    embed = false,
  } = options;

  const introText = `Ingresá tu código de seguimiento para conocer el estado de tu envío en ${storeName}.`;
  const alertMessage = errorMessage ?? disabledMessage;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Seguimiento de envio</title>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
    }
    body {
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #eceff3;
      color: #111827;
      -webkit-font-smoothing: antialiased;
    }
    .page {
      max-width: 720px;
      margin: 0 auto;
      padding: ${embed ? "16px 12px 24px" : "40px 20px 48px"};
    }
    .card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      box-shadow: 0 8px 28px rgba(17, 24, 39, 0.06);
      padding: 28px 24px 24px;
    }
    .intro {
      margin: 0 0 24px;
      text-align: center;
      font-size: 15px;
      line-height: 1.55;
      color: #374151;
    }
    .field-label {
      display: block;
      margin: 0 0 10px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #6b7280;
      text-align: center;
    }
    input[type="text"] {
      width: 100%;
      padding: 18px 16px;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      background: #fff;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-align: center;
      color: #111827;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    input[type="text"]::placeholder {
      color: #9ca3af;
      font-weight: 700;
    }
    input[type="text"]:focus {
      border-color: #111827;
      box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
    }
    .hint {
      margin: 10px 0 18px;
      text-align: center;
      font-size: 13px;
      line-height: 1.45;
      color: #6b7280;
    }
    button[type="submit"] {
      width: 100%;
      border: none;
      border-radius: 10px;
      padding: 16px 18px;
      background: #111827;
      color: #fff;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.05s ease;
    }
    button[type="submit"]:hover { background: #000; }
    button[type="submit"]:active { transform: translateY(1px); }
    .alert {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-top: 16px;
      padding: 14px 16px;
      border-radius: 10px;
      font-size: 14px;
      line-height: 1.45;
    }
    .alert-error {
      background: #fff5f5;
      border: 1px solid #fca5a5;
      color: #991b1b;
    }
    .alert-warning {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      color: #92400e;
    }
    .alert-icon {
      flex: 0 0 18px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 900;
      line-height: 1;
      margin-top: 1px;
    }
    .alert-error .alert-icon {
      background: #ef4444;
      color: #fff;
    }
    .alert-warning .alert-icon {
      background: #f59e0b;
      color: #fff;
    }
    .result-block {
      margin-top: 28px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }
    .result-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .result-code {
      margin: 6px 0 0;
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 0.1em;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      text-align: right;
    }
    .status-pill {
      display: inline-block;
      margin-top: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
    }
    .status-preparing { background: #f3f4f6; color: #374151; }
    .status-shipped { background: #fef3c7; color: #92400e; }
    .status-delivered { background: #dcfce7; color: #166534; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    .result-meta {
      display: grid;
      gap: 6px;
      margin-bottom: 18px;
      font-size: 14px;
      color: #4b5563;
      text-align: center;
    }
    .timeline {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .timeline-item {
      display: grid;
      grid-template-columns: 16px 1fr;
      gap: 12px;
      position: relative;
      padding-bottom: 16px;
    }
    .timeline-item:not(:last-child)::before {
      content: "";
      position: absolute;
      left: 7px;
      top: 16px;
      bottom: 0;
      width: 2px;
      background: #e5e7eb;
    }
    .timeline-item.done:not(:last-child)::before {
      background: #111827;
    }
    .timeline-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #d1d5db;
      background: #fff;
      margin-top: 2px;
    }
    .timeline-item.done .timeline-dot {
      border-color: #111827;
      background: #111827;
    }
    .timeline-content strong {
      display: block;
      font-size: 14px;
      margin-bottom: 2px;
    }
    .timeline-date {
      font-size: 12px;
      color: #6b7280;
    }
    @media (max-width: 480px) {
      .card { padding: 22px 16px 18px; }
      input[type="text"] { font-size: 18px; padding: 16px 12px; }
      .result-code { font-size: 17px; }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="card">
      <p class="intro">${escHtml(introText)}</p>

      <form method="get" action="/seguimiento">
        <label class="field-label" for="code">Código de seguimiento</label>
        <input
          id="code"
          name="code"
          type="text"
          value="${escHtml(codeInput)}"
          placeholder="TPA00100001"
          autocomplete="off"
          spellcheck="false"
          inputmode="text"
        />
        <p class="hint">El código figura en el mail de confirmación de envío.</p>
        <button type="submit">Consultar</button>
      </form>

      ${result ? renderResult(result) : ""}
    </section>

    ${alertMessage ? renderAlert(alertMessage, disabledMessage ? "warning" : "error") : ""}
  </main>
</body>
</html>`;
};
