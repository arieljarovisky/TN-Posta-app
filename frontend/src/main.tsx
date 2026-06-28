import {
  completeOAuthInstallIfNeeded,
  redirectToAdminIfInstalled,
} from "./app/oauth/oauthInstall";
import { connectNexo } from "./app/nexoBootstrap";

const showRedirectMessage = (message: string): void => {
  const root = document.getElementById("root");

  if (!root) {
    return;
  }

  root.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#1a1a1a">${message}</div>`;
};

if (completeOAuthInstallIfNeeded()) {
  showRedirectMessage("Instalando aplicacion...");
} else if (redirectToAdminIfInstalled()) {
  showRedirectMessage("Redirigiendo al administrador de Tiendanube...");
} else {
  const loadApp = (): Promise<void> =>
    import("./bootstrap").then(({ renderApp }) => {
      renderApp();
    });

  const renderTimeout = window.setTimeout(() => {
    console.warn("[auth/frontend] Renderizando app tras timeout de Nexo");
    loadApp();
  }, 4000);

  connectNexo().finally(() => {
    window.clearTimeout(renderTimeout);
    loadApp();
  });
}
