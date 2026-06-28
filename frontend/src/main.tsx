import { connectNexo } from "./app/nexoBootstrap";

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
