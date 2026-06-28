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
  <section class="result-card">
    <div class="result-header">
      <div>
        <p class="result-label">Codigo</p>
        <p class="result-code">${escHtml(result.trackingCode)}</p>
      </div>
      <span class="status-pill ${statusClass(result.status)}">${escHtml(result.statusLabel)}</span>
    </div>
    <div class="result-meta">
      <p><strong>Pedido</strong> #${escHtml(result.orderNumber)}</p>
      <p><strong>Destino</strong> ${escHtml(result.destinationCity)}</p>
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
};

export const buildTrackingPageHtml = (options: TrackingPageOptions): string => {
  const {
    pageTitle,
    storeName = "TN Posta",
    codeInput = "",
    errorMessage = null,
    disabledMessage = null,
    result = null,
  } = options;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escHtml(pageTitle)} · ${escHtml(storeName)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
      color: #0f172a;
    }
    .page {
      max-width: 560px;
      margin: 0 auto;
      padding: 32px 20px 48px;
    }
    .brand {
      text-align: center;
      margin-bottom: 24px;
    }
    .brand-kicker {
      font-size: 12px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #64748b;
      margin: 0 0 8px;
    }
    .brand-title {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      line-height: 1.15;
    }
    .brand-subtitle {
      margin: 8px 0 0;
      color: #475569;
      font-size: 15px;
      line-height: 1.5;
    }
    .search-card, .result-card, .message-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
      padding: 24px;
    }
    .search-card { margin-bottom: 20px; }
    label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #334155;
    }
    .input-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    input[type="text"] {
      flex: 1 1 220px;
      min-width: 0;
      padding: 14px 16px;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      font-size: 16px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    button {
      border: none;
      border-radius: 12px;
      padding: 14px 18px;
      font-size: 15px;
      font-weight: 800;
      background: #2563eb;
      color: #fff;
      cursor: pointer;
    }
    button:hover { background: #1d4ed8; }
    .hint {
      margin: 12px 0 0;
      font-size: 13px;
      color: #64748b;
      line-height: 1.45;
    }
    .message-card {
      margin-top: 20px;
      color: #334155;
    }
    .message-card.error {
      border-color: #fecaca;
      background: #fef2f2;
      color: #991b1b;
    }
    .message-card.warning {
      border-color: #fde68a;
      background: #fffbeb;
      color: #92400e;
    }
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 18px;
    }
    .result-label {
      margin: 0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #64748b;
    }
    .result-code {
      margin: 4px 0 0;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 0.1em;
      font-family: ui-monospace, monospace;
    }
    .status-pill {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      white-space: nowrap;
    }
    .status-preparing { background: #dbeafe; color: #1d4ed8; }
    .status-shipped { background: #fef3c7; color: #b45309; }
    .status-delivered { background: #dcfce7; color: #15803d; }
    .status-cancelled { background: #fee2e2; color: #b91c1c; }
    .result-meta {
      display: grid;
      gap: 8px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #475569;
    }
    .timeline {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 0;
    }
    .timeline-item {
      display: grid;
      grid-template-columns: 18px 1fr;
      gap: 12px;
      position: relative;
      padding-bottom: 18px;
    }
    .timeline-item:not(:last-child)::before {
      content: "";
      position: absolute;
      left: 8px;
      top: 18px;
      bottom: 0;
      width: 2px;
      background: #e2e8f0;
    }
    .timeline-item.done:not(:last-child)::before {
      background: #93c5fd;
    }
    .timeline-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid #cbd5e1;
      background: #fff;
      margin-top: 2px;
    }
    .timeline-item.done .timeline-dot {
      border-color: #2563eb;
      background: #2563eb;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
    }
    .timeline-content strong {
      display: block;
      font-size: 14px;
      margin-bottom: 2px;
    }
    .timeline-date {
      font-size: 12px;
      color: #64748b;
    }
    .footer {
      margin-top: 28px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="brand">
      <p class="brand-kicker">Seguimiento de envio</p>
      <h1 class="brand-title">${escHtml(pageTitle)}</h1>
      <p class="brand-subtitle">Ingresa tu codigo TPA para ver el estado de tu pedido en ${escHtml(storeName)}.</p>
    </header>

    <section class="search-card">
      <form method="get" action="/seguimiento">
        <label for="code">Codigo de seguimiento</label>
        <div class="input-row">
          <input
            id="code"
            name="code"
            type="text"
            value="${escHtml(codeInput)}"
            placeholder="TPA00100001"
            autocomplete="off"
            spellcheck="false"
          />
          <button type="submit">Consultar</button>
        </div>
        <p class="hint">Encontras el codigo en la etiqueta o comunicacion de envio de tu tienda.</p>
      </form>
    </section>

    ${
      errorMessage
        ? `<section class="message-card error"><strong>No pudimos consultar el envio.</strong><br/>${escHtml(errorMessage)}</section>`
        : ""
    }
    ${
      disabledMessage
        ? `<section class="message-card warning"><strong>Seguimiento no disponible.</strong><br/>${escHtml(disabledMessage)}</section>`
        : ""
    }
    ${result ? renderResult(result) : ""}

    <p class="footer">Powered by TN Posta</p>
  </main>
</body>
</html>`;
};
