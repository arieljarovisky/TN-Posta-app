import axios from "axios";

import { HttpErrorException } from "@utils";
import { logError, logInfo } from "@utils/logger";

export const tiendanubeAuthClient = axios.create({
  baseURL: process.env.TIENDANUBE_AUTENTICATION_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

tiendanubeAuthClient.interceptors.request.use(
  (config) => {
    logInfo("auth/tiendanube-client", "Enviando request OAuth", {
      method: config.method,
      baseURL: config.baseURL,
      url: config.url,
    });

    return config;
  },
  function (error) {
    logError("auth/tiendanube-client", "Error preparando request OAuth", error);
    return Promise.reject(error);
  }
);

tiendanubeAuthClient.interceptors.response.use(
  (response) => {
    logInfo("auth/tiendanube-client", "Respuesta OAuth recibida", {
      status: response.status,
      hasAccessToken: Boolean(response.data?.access_token),
      userId: response.data?.user_id ?? null,
      scope: response.data?.scope ?? null,
      error: response.data?.error ?? null,
    });

    return response.data || {};
  },
  function (error) {
    if (error.isAxiosError) {
      const status = error.response?.status;
      const data = error.response?.data;

      logError("auth/tiendanube-client", "Error HTTP en OAuth", error, {
        status,
        responseData: data ?? null,
        authUrl: process.env.TIENDANUBE_AUTENTICATION_URL,
      });

      const payload = new HttpErrorException(
        "TiendanubeAuthClient - " + (data?.message ?? data?.error ?? "OAuth error"),
        data?.description ?? data?.error_description ?? error.message
      );
      payload.setStatusCode(status ?? 500);
      return Promise.reject(payload);
    }

    logError("auth/tiendanube-client", "Error desconocido en OAuth", error);
    return Promise.reject(error);
  }
);
