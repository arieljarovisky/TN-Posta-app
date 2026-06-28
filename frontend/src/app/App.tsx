import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@nimbus-ds/components";
import { ErrorBoundary } from "@tiendanube/nexo";

import Router from "./Router";
import NexoSyncRoute from "./NexoSyncRoute";
import { DarkModeProvider } from "./DarkModeProvider";
import {
  completeOAuthInstallIfNeeded,
  getInstallStatusFromUrl,
} from "./oauth/oauthInstall";
import { isTiendanubeEmbedded } from "./oauth/installUi";
import InstallSuccessScreen from "./oauth/InstallSuccessScreen";
import StandaloneNoticeScreen from "./oauth/StandaloneNoticeScreen";
import { getNexoStatus, nexo } from "./nexoBootstrap";
import "./I18n";

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
  const [isInstalling] = useState(() => completeOAuthInstallIfNeeded());
  const [showInstallSuccess] = useState(
    () =>
      !isTiendanubeEmbedded() && getInstallStatusFromUrl().installed
  );
  const nexoStatus = getNexoStatus();

  if (isInstalling) {
    return <LoadingScreen message="Instalando aplicacion..." />;
  }

  if (showInstallSuccess) {
    return <InstallSuccessScreen />;
  }

  if (nexoStatus === "pending") {
    return <LoadingScreen message="Conectando..." />;
  }

  if (nexoStatus === "failed" && !isTiendanubeEmbedded()) {
    return <StandaloneNoticeScreen />;
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
