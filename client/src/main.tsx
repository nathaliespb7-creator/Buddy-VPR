import { createRoot } from "react-dom/client";
import "@fontsource-variable/nunito";
import App from "./App";
import "./index.css";

// PWA: регистрация Service Worker; при появлении новой версии — перезагрузка (для «добавить на экран»)
if ("serviceWorker" in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hadController) window.location.reload();
    });
  });
}

function showLoadError(message: string) {
  const rootEl = document.getElementById("root");
  if (!rootEl) return;
  rootEl.innerHTML = [
    '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;font-family:\'Nunito Variable\',\'Nunito\',sans-serif;background:hsl(160 50% 97%);">',
    '<h2 style="color:#0d9488;margin-bottom:0.5rem;">Ошибка загрузки</h2>',
    '<p style="color:#64748b;margin-bottom:1rem;text-align:center;max-width:400px;">' + message + "</p>",
    '<p style="color:#94a3b8;font-size:0.875rem;margin-bottom:1rem;">Откройте консоль (F12 или Cmd+Option+I) для подробностей.</p>',
    '<button type="button" onclick="location.reload()" style="padding:0.5rem 1rem;background:#0d9488;color:white;border:none;border-radius:8px;cursor:pointer;">Обновить</button>',
    "</div>",
  ].join("");
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("No #root");

window.addEventListener("error", (e) => {
  if (!(document.getElementById("root")?.innerHTML ?? "").includes("Ошибка загрузки")) {
    showLoadError(e.message || "Неизвестная ошибка");
    console.error(e.error ?? e);
  }
});
window.addEventListener("unhandledrejection", (e) => {
  if (!(document.getElementById("root")?.innerHTML ?? "").includes("Ошибка загрузки")) {
    const msg = e.reason?.message ?? String(e.reason ?? "Ошибка загрузки");
    showLoadError(msg);
    console.error(e.reason);
  }
});

try {
  createRoot(rootEl).render(<App />);
} catch (err) {
  showLoadError(err instanceof Error ? err.message : "Не удалось запустить приложение.");
  console.error("App failed to mount:", err);
}
