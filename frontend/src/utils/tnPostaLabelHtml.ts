export interface SenderConfig {
  business_name: string;
  address?: string;
  city?: string;
  phone?: string;
}

export type TnPostaLabelShipment = {
  id: string;
  order_id: number;
  order_number: number;
  shipping_method?: string;
  total_units?: number;
  recipient: {
    name: string;
    phone?: string;
  };
  destination: {
    street: string;
    number: string;
    floor?: string;
    locality?: string;
    city: string;
    province: string;
    zipcode: string;
  };
};

const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const getDeliveryQrUrl = (trackingCode: string): string => {
  const code = encodeURIComponent(String(trackingCode || "").trim().toUpperCase());
  const envBase = (import.meta.env.VITE_PUBLIC_DELIVERY_BASE_URL as string | undefined)?.trim();

  if (envBase) {
    return `${envBase.replace(/\/$/, "")}/${code}`;
  }

  const origin = window.location.origin.replace(/\/$/, "");

  return `${origin}/api/public/entrega/${code}`;
};

const formatShippingAddress = (
  destination: TnPostaLabelShipment["destination"]
): string => {
  const line1 = [destination.street, destination.number]
    .filter(Boolean)
    .join(" ")
    .trim();
  const line2 = destination.floor ? `Piso ${destination.floor}` : "";
  const line3 = [destination.locality, destination.city, destination.province]
    .filter(Boolean)
    .join(", ")
    .trim();
  const line4 = destination.zipcode ? `CP ${destination.zipcode}` : "";

  return [line1, line2, line3, line4].filter(Boolean).join("<br/>") || "Sin direccion de envio";
};

export const buildTnPostaLabelInnerHtml = (
  shipment: TnPostaLabelShipment,
  trackingCode: string,
  sender: SenderConfig
): string => {
  const empresa = (sender.business_name || "TN Posta").trim();
  const empresaDir = [sender.address, sender.city].filter(Boolean).join(", ");
  const empresaPhone = (sender.phone || "").trim();
  const customerName = (shipment.recipient.name || "Cliente").trim();
  const customerPhone = (shipment.recipient.phone || "").trim();
  const shippingMethod = (shipment.shipping_method || "TN Posta").trim();
  const address = formatShippingAddress(shipment.destination);
  const totalUnits = shipment.total_units ?? 0;
  const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(trackingCode)}&scale=3&height=12&includetext`;
  const deliveryUrl = getDeliveryQrUrl(trackingCode);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(deliveryUrl)}`;

  return `
  <div class="express-label">
    <div class="header">
      <div class="badge">TN POSTA</div>
      <div class="order-ref">
        <strong>TN #${esc(shipment.order_number)}</strong>
        ID ${esc(shipment.order_id)}<br/>
        ${totalUnits} u.
      </div>
    </div>
    <div class="block">
      <div class="block-title">Remitente</div>
      <div><strong>${esc(empresa)}</strong></div>
      ${empresaDir ? `<div>${esc(empresaDir)}</div>` : ""}
      ${empresaPhone ? `<div>Tel: ${esc(empresaPhone)}</div>` : ""}
    </div>
    <div class="block">
      <div class="block-title">Destinatario</div>
      <div class="dest-name">${esc(customerName)}</div>
      ${customerPhone ? `<div class="dest-phone">Tel: ${esc(customerPhone)}</div>` : ""}
      <div style="margin-top:6px;line-height:1.35;">${address}</div>
    </div>
    <div class="tracking">
      <div class="tracking-label">Codigo de seguimiento</div>
      <div class="tracking-code">${esc(trackingCode)}</div>
      <div class="barcode"><img src="${barcodeUrl}" alt="Codigo de barras" /></div>
      <div class="qr-row">
        <img src="${qrUrl}" alt="QR confirmar entrega" />
      </div>
      <div class="qr-caption">Escanear para iniciar viaje / confirmar entrega</div>
    </div>
    <div class="meta">
      <span>${esc(shippingMethod)}</span>
      <span>Tienda Nube</span>
    </div>
  </div>`;
};

export const EXPRESS_LABEL_CSS = `
  .express-label { width: 92mm; margin: 0 auto; border: 2px solid #111; padding: 6px; display: flex; flex-direction: column; gap: 6px; font-size: 11px; }
  .express-label .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 6px; }
  .express-label .badge { background: #111; color: #fff; font-weight: 900; font-size: 13px; padding: 4px 8px; letter-spacing: 0.05em; }
  .express-label .order-ref { text-align: right; font-size: 10px; line-height: 1.35; }
  .express-label .order-ref strong { font-size: 14px; display: block; }
  .express-label .block { border: 1px solid #333; border-radius: 4px; padding: 6px; }
  .express-label .block-title { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; color: #444; margin-bottom: 3px; }
  .express-label .dest-name { font-size: 15px; font-weight: 900; line-height: 1.2; }
  .express-label .dest-phone { font-size: 11px; margin-top: 2px; }
  .express-label .tracking { text-align: center; border: 2px dashed #111; border-radius: 6px; padding: 8px 4px; }
  .express-label .tracking-code { font-size: 20px; font-weight: 900; letter-spacing: 0.12em; font-family: monospace; }
  .express-label .tracking-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #444; margin-bottom: 4px; }
  .express-label .barcode img { max-width: 100%; height: auto; display: block; margin: 4px auto 0; }
  .express-label .qr-row { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 6px; }
  .express-label .qr-row img { width: 64px; height: 64px; border: 1px solid #ccc; }
  .express-label .qr-caption { font-size: 8px; text-transform: uppercase; letter-spacing: 0.06em; color: #444; margin-top: 4px; font-weight: 700; }
  .express-label .meta { font-size: 10px; color: #333; display: flex; justify-content: space-between; gap: 8px; }
`;

export const EXPRESS_LABEL_BULK_CSS = `
  @page { size: A4 portrait; margin: 6mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; }
  ${EXPRESS_LABEL_CSS}
  .labels-page { page-break-after: always; }
  .labels-page:last-child { page-break-after: auto; }
  .labels-sheet {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4mm;
    align-items: start;
  }
  .label-cell { break-inside: avoid; page-break-inside: avoid; }
  .labels-sheet .express-label {
    width: 100%;
    max-width: none;
    margin: 0;
    font-size: 9px;
    padding: 4px;
    gap: 4px;
  }
  .labels-sheet .express-label .badge { font-size: 11px; padding: 3px 6px; }
  .labels-sheet .express-label .order-ref strong { font-size: 12px; }
  .labels-sheet .express-label .dest-name { font-size: 12px; }
  .labels-sheet .express-label .tracking-code { font-size: 15px; }
  .labels-sheet .express-label .qr-row img { width: 50px; height: 50px; }
  .labels-sheet .express-label .qr-caption { font-size: 7px; }
  .print-header {
    text-align: center; font-size: 11px; color: #444; margin-bottom: 4mm;
    padding-bottom: 2mm; border-bottom: 1px dashed #ccc;
  }
  .print-actions { margin-top: 12px; text-align: center; }
  @media print {
    .print-actions, .print-header { display: none; }
    body { margin: 0; }
  }
`;

export type LabelPrintItem = {
  shipment: TnPostaLabelShipment;
  trackingCode: string;
};

const LABELS_PER_A4_PAGE = 4;

export const buildTnPostaLabelsBulkHtml = (
  items: LabelPrintItem[],
  sender: SenderConfig
): string => {
  if (items.length === 0) {
    return `<!DOCTYPE html><html><body><p>Sin etiquetas para imprimir.</p></body></html>`;
  }

  const pages: string[] = [];

  for (let index = 0; index < items.length; index += LABELS_PER_A4_PAGE) {
    const chunk = items.slice(index, index + LABELS_PER_A4_PAGE);
    const cells = chunk
      .map(
        ({ shipment, trackingCode }) =>
          `<div class="label-cell">${buildTnPostaLabelInnerHtml(shipment, trackingCode, sender)}</div>`
      )
      .join("");
    pages.push(`<div class="labels-page"><div class="labels-sheet">${cells}</div></div>`);
  }

  const orderNumbers = items.map((item) => item.shipment.order_number).join(", ");
  const title =
    items.length === 1
      ? `Etiqueta TN Posta #${items[0].shipment.order_number}`
      : `Etiquetas TN Posta (${items.length})`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>${EXPRESS_LABEL_BULK_CSS}</style>
</head>
<body>
  <div class="print-header">
    ${items.length} etiqueta${items.length !== 1 ? "s" : ""} TN Posta · ${LABELS_PER_A4_PAGE} por hoja A4 · Pedidos: ${esc(orderNumbers)}
  </div>
  ${pages.join("")}
  <div class="print-actions">
    <button onclick="window.print()" style="padding:10px 14px;background:#1f2937;color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Imprimir / PDF (${items.length} etiquetas)</button>
    <button onclick="window.close()" style="padding:10px 14px;margin-left:8px;background:#94a3b8;color:#fff;border:none;border-radius:6px;cursor:pointer;">Cerrar</button>
  </div>
</body>
</html>`;
};

export const buildTnPostaLabelHtml = (
  shipment: TnPostaLabelShipment,
  trackingCode: string,
  sender: SenderConfig
): string => {
  const inner = buildTnPostaLabelInnerHtml(shipment, trackingCode, sender);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Etiqueta TN Posta #${shipment.order_number}</title>
  <style>
    @page { size: 100mm 150mm; margin: 4mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; }
    ${EXPRESS_LABEL_CSS}
    .print-actions { margin-top: 10px; text-align: center; }
    @media print { .print-actions { display: none; } body { margin: 0; } }
  </style>
</head>
<body>
  ${inner}
  <div class="print-actions">
    <button onclick="window.print()" style="padding:10px 14px;background:#1f2937;color:#fff;border:none;border-radius:6px;font-weight:700;cursor:pointer;">Imprimir etiqueta</button>
    <button onclick="window.close()" style="padding:10px 14px;margin-left:8px;background:#94a3b8;color:#fff;border:none;border-radius:6px;cursor:pointer;">Cerrar</button>
  </div>
</body>
</html>`;
};

export const openPrintableHtml = (html: string): void => {
  const popup = window.open("", "_blank");

  if (!popup) {
    return;
  }

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
};
