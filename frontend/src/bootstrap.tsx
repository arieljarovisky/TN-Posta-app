import ReactDOM from "react-dom/client";

import App from "@/app";

import "@nimbus-ds/styles/dist/index.css";
import "./main.css";

export const renderApp = (): void => {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
};
