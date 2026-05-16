import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const base = import.meta.env.BASE_URL;
const faviconHref = `${base}favicon.ico`;
for (const link of document.querySelectorAll<HTMLLinkElement>(
  'link[rel="icon"][type="image/x-icon"]'
)) {
  link.href = faviconHref;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
