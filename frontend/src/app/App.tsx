import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@nimbus-ds/components";
import { ThemeProvider } from "@nimbus-ds/styles";
import { ErrorBoundary } from "@tiendanube/nexo";

import Router from "./Router";
import NexoSyncRoute from "./NexoSyncRoute";
import { DarkModeProvider } from "./DarkModeProvider";
import { getInstallStatusFromUrl } from "./oauth/oauthInstall";
import { getTiendanubeAdminUrl, isTiendanubeEmbedded } from "./oauth/installUi";
import OAuthInstallScreen from "./oauth/OAuthInstallScreen";
import StandaloneNoticeScreen from "./oauth/StandaloneNoticeScreen";
import { getNexoStatus, nexo } from "./nexoBootstrap";
import "./I18n";

const InstallShell = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme="base">{children}</ThemeProvider>
);

const LoadingScreen = ({ message }: { message: string }) => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, sans-serif",
      color: "#1a1a1a",
    }}
  >
    {message}
  </div>
);

const App = () => {
  const [installStatus] = useState(() => getInstallStatusFromUrl());
  const nexoStatus = getNexoStatus();

  useEffect(() => {
    if (!installStatus.installed) {
      return;
    }

    const adminUrl = getTiendanubeAdminUrl();

    if (adminUrl.includes("mitiendanube.com/admin/v2/apps/")) {
      window.location.replace(adminUrl);
    }
  }, [installStatus.installed]);

  if (installStatus.missingCode) {
    return (
      <InstallShell>
        <OAuthInstallScreen variant="missing_code" />
      </InstallShell>
    );
  }

  if (installStatus.error) {
    return (
      <InstallShell>
        <OAuthInstallScreen
          variant="error"
          errorMessage={decodeURIComponent(installStatus.error)}
        />
      </InstallShell>
    );
  }

  if (installStatus.installed) {
    return (
      <InstallShell>
        <LoadingScreen message="Redirigiendo al administrador de Tiendanube..." />
      </InstallShell>
    );
  }

  if (nexoStatus === "pending") {
    return <LoadingScreen message="Conectando..." />;
  }

  if (nexoStatus === "failed" && !isTiendanubeEmbedded()) {
    return (
      <InstallShell>
        <StandaloneNoticeScreen />
      </InstallShell>
    );
  }

  if (nexoStatus === "failed") {
    return (
      <LoadingScreen message="No se pudo conectar con Tiendanube. Recarga la pagina." />
    );
  }

  return (
    <ErrorBoundary nexo={nexo}>
      <DarkModeProvider>
        <ToastProvider>
          <BrowserRouter>
            <NexoSyncRoute>
              <Router />
            </NexoSyncRoute>
          </BrowserRouter>
        </ToastProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  );
};

export default App;
