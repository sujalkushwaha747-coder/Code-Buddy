import React from "react";
import ReactDOM from "react-dom/client";
import ErrorBoundary from "./ErrorBoundary";
import AppRouter from "./router"; // ✅ import router
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppRouter /> {/* ✅ use router */}
    </ErrorBoundary>
  </React.StrictMode>
);
