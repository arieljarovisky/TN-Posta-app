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
} from "./oauth/oauthInstall";
import "./I18n";

const App = () => {
  const [isConnect, setIsConnect] = useState(false);
  const [isInstalling, setIsInstalling] = useState(
    () => completeOAuthInstallIfNeeded()
  );

  useEffect(() => {
    if (isInstalling) {
      return;
    }

    if (!isConnect) {
      connect(nexo)
        .then(async () => {
          setIsConnect(true);
          iAmReady(nexo);
        })
        .catch(() => {
          setIsConnect(false);
        });
    }
  }, [isConnect, isInstalling]);

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

  if (!isConnect) {
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
