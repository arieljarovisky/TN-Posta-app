import { connect, iAmReady } from "@tiendanube/nexo";

import nexo from "./NexoClient/NexoClient";

export type NexoStatus = "pending" | "connected" | "failed";

let status: NexoStatus = "pending";

export const getNexoStatus = (): NexoStatus => status;

export const connectNexo = (): Promise<void> => {
  console.info("[auth/frontend] Iniciando connect Nexo...");

  return connect(nexo)
    .then(() => {
      console.info("[auth/frontend] Nexo conectado, enviando iAmReady");
      iAmReady(nexo);
      status = "connected";
    })
    .catch((error) => {
      console.error("[auth/frontend] Error conectando Nexo", error);
      status = "failed";
    });
};

export { nexo };
