const maskValue = (value?: string): string => {
  if (!value) {
    return "MISSING";
  }

  if (value.length <= 4) {
    return "****";
  }

  return `${value.slice(0, 4)}****`;
};

export const logInfo = (
  scope: string,
  message: string,
  data?: Record<string, unknown>
): void => {
  if (data) {
    console.info(`[${scope}] ${message}`, JSON.stringify(data, null, 2));
    return;
  }

  console.info(`[${scope}] ${message}`);
};

export const logError = (
  scope: string,
  message: string,
  error?: unknown,
  data?: Record<string, unknown>
): void => {
  const payload = {
    ...data,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
  };

  console.error(`[${scope}] ${message}`, JSON.stringify(payload, null, 2));
};

export const logEnvStatus = (): void => {
  logInfo("startup", "Variables de entorno detectadas", {
    NODE_ENV: process.env.NODE_ENV ?? "undefined",
    PORT: process.env.PORT ?? "undefined",
    CLIENT_ID: process.env.CLIENT_ID ?? "MISSING",
    CLIENT_EMAIL: process.env.CLIENT_EMAIL ?? "MISSING",
    CLIENT_SECRET: maskValue(process.env.CLIENT_SECRET),
    SECRET_KEY: maskValue(process.env.SECRET_KEY),
    TIENDANUBE_AUTENTICATION_URL:
      process.env.TIENDANUBE_AUTENTICATION_URL ?? "MISSING",
    TIENDANUBE_API_URL: process.env.TIENDANUBE_API_URL ?? "MISSING",
  });
};

export const maskCode = (code?: string): string => {
  if (!code) {
    return "MISSING";
  }

  return `${code.slice(0, 6)}...${code.slice(-4)} (${code.length} chars)`;
};
