import nexo from "@tiendanube/nexo";

declare global {
  interface Window {
    __TN_POSTA_CONFIG__?: {
      clientId?: string;
      storeSlug?: string;
      storeAdminUrl?: string;
    };
  }
}

const resolveClientId = (): string => {
  const runtimeClientId = window.__TN_POSTA_CONFIG__?.clientId;
  if (runtimeClientId) {
    return String(runtimeClientId);
  }

  if (import.meta.env.VITE_CLIENT_ID) {
    return String(import.meta.env.VITE_CLIENT_ID);
  }

  return "35321";
};

const clientId = resolveClientId();

console.info("[auth/frontend] Nexo clientId configurado", { clientId });

const instance = nexo.create({
  clientId,
  log: import.meta.env.DEV,
});

export default instance;
