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

const NEXO_CONNECT_TIMEOUT_MS = 8000;

const App = () => {
  const [isConnect, setIsConnect] = useState(false);
  const [nexoFailed, setNexoFailed] = useState(false);
  const [showInstallSuccess, setShowInstallSuccess] = useState(
    () => getInstallStatusFromUrl().installed
  );
  const [isInstalling] = useState(() => completeOAuthInstallIfNeeded());
  const isEmbedded = isTiendanubeEmbedded();

  useEffect(() => {
    if (isInstalling || showInstallSuccess) {
      return;
    }

    if (!isEmbedded) {
      console.info(
        "[auth/frontend] App abierta fuera del admin de Tiendanube"
      );
      return;
    }

    if (isConnect || nexoFailed) {
      return;
    }

    console.info("[auth/frontend] Conectando Nexo...");

    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        console.warn("[auth/frontend] Timeout conectando Nexo");
        setNexoFailed(true);
      }
    }, NEXO_CONNECT_TIMEOUT_MS);

    connect(nexo)
      .then(async () => {
        if (cancelled) {
          return;
        }

        console.info("[auth/frontend] Nexo conectado correctamente");
        setIsConnect(true);
        iAmReady(nexo);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error("[auth/frontend] Error conectando Nexo", error);
        setNexoFailed(true);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isConnect, isInstalling, isEmbedded, nexoFailed, showInstallSuccess]);

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
    return (
      <InstallSuccessScreen
        onContinue={() => setShowInstallSuccess(false)}
      />
    );
  }

  if (!isEmbedded) {
    return <StandaloneNoticeScreen />;
  }

  if (!isConnect) {
    if (nexoFailed) {
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
