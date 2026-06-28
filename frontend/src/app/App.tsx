import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { Box, Text, ToastProvider } from "@nimbus-ds/components";
import { connect, ErrorBoundary, iAmReady } from "@tiendanube/nexo";

import Router from "./Router";
import nexo from "./NexoClient";
import NexoSyncRoute from "./NexoSyncRoute";
import { DarkModeProvider } from "./DarkModeProvider";
import {
  completeOAuthInstallIfNeeded,
  getInstallStatusFromUrl,
} from "./oauth/oauthInstall";
import { isTiendanubeEmbedded } from "./oauth/installUi";
import InstallSuccessScreen from "./oauth/InstallSuccessScreen";
import StandaloneNoticeScreen from "./oauth/StandaloneNoticeScreen";
import "./I18n";

const App = () => {
  const [isConnect, setIsConnect] = useState(false);
  const [nexoFailed, setNexoFailed] = useState(false);
  const [isInstalling] = useState(() => completeOAuthInstallIfNeeded());
  const [showInstallSuccess] = useState(
    () =>
      !isTiendanubeEmbedded() && getInstallStatusFromUrl().installed
  );

  useEffect(() => {
    if (isInstalling || showInstallSuccess) {
      return;
    }

    let cancelled = false;

    console.info("[auth/frontend] Iniciando connect Nexo...");

    connect(nexo)
      .then(() => {
        if (cancelled) {
          return;
        }

        console.info("[auth/frontend] Nexo conectado, enviando iAmReady");
        iAmReady(nexo);
        setIsConnect(true);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("[auth/frontend] Error conectando Nexo", error);
        setNexoFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isInstalling, showInstallSuccess]);

  if (isInstalling) {
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text>Instalando aplicacion...</Text>
      </Box>
    );
  }

  if (showInstallSuccess) {
    return <InstallSuccessScreen />;
  }

  if (!isConnect) {
    if (nexoFailed && !isTiendanubeEmbedded()) {
      return <StandaloneNoticeScreen />;
    }

    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text>Conectando...</Text>
      </Box>
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
