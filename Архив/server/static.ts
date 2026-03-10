import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function serveStatic(app: Express) {
  // Клиент собирается в корень проекта/dist (vite build outDir: "../dist")
  const distPath = path.resolve(__dirname, "..", "dist");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Важно: сначала статика (файлы из dist), потом SPA fallback — иначе * перехватит запросы к .js/.css
  app.use(express.static(distPath));

  // SPA fallback: для любых GET, не обработанных статикой и не /api, отдаём index.html
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}
