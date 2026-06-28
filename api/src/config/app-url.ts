export const getPublicAppUrl = (): string => {
  const configured = process.env.APP_PUBLIC_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const port = process.env.PORT || "8000";

  return `http://localhost:${port}`;
};

export const getShippingRatesCallbackUrl = (): string =>
  `${getPublicAppUrl()}/shipping/rates`;
