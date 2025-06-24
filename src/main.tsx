import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "../src/index.css";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster
      richColors
      position="top-center"
      closeButton
      toastOptions={{
        duration: 3000,
      }}
    />
  </StrictMode>
);
