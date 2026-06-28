import axios from "axios";

import { userRepository } from "@repository";
import { HttpErrorException } from "@utils";

const formatTiendanubeApiMessage = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(" ");
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value as Record<string, unknown>)
      .flatMap(([key, entry]) => {
        if (Array.isArray(entry)) {
          return entry.map((item) => `${key}: ${String(item)}`);
        }

        return [`${key}: ${String(entry)}`];
      })
      .join(" ");
  }

  if (value == null) {
    return "Error de API";
  }

  return String(value);
};

export const getTiendanubeContentApiBaseUrl = (): string => {
  const configured = process.env.TIENDANUBE_API_URL?.replace(/\/$/, "");

  if (configured?.includes("/2025-03")) {
    return configured;
  }

  if (configured?.includes("/v1")) {
    return configured.replace(/\/v1$/, "/2025-03");
  }

  if (configured) {
    return `${configured}/2025-03`;
  }

  return "https://api.tiendanube.com/2025-03";
};

export const tiendanubeContentApiClient = axios.create({
  baseURL: getTiendanubeContentApiBaseUrl(),
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": `${process.env.CLIENT_ID} (${process.env.CLIENT_EMAIL})`,
  },
});

tiendanubeContentApiClient.interceptors.request.use(
  (config) => {
    const storeId = +config.url?.split("/")[0]!!;
    const credentials = userRepository.findOptional(storeId);

    if (!credentials?.access_token) {
      return Promise.reject(
        new HttpErrorException(
          "Tienda no autorizada",
          "Reinstala la app desde Tiendanube para volver a conectar la tienda."
        ).setStatusCode(401)
      );
    }

    config.headers["Authorization"] = `Bearer ${credentials.access_token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

tiendanubeContentApiClient.interceptors.response.use(
  (response) => response.data || {},
  (error) => {
    if (error.isAxiosError) {
      const { data, status } = error.response ?? {};
      const payload = new HttpErrorException(
        "TiendanubeContentApiClient - " +
          formatTiendanubeApiMessage(data?.message ?? data),
        formatTiendanubeApiMessage(data?.description ?? data?.error ?? data)
      );
      payload.setStatusCode(data?.code ?? status ?? 500);
      return Promise.reject(payload);
    }

    return Promise.reject(error);
  }
);
