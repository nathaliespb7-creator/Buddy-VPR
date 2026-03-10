import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import { fileURLToPath } from "url";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const projectRoot = path.resolve(__dirname, "..");
  const serverOptions = {
    middlewareMode: true,
    hmr: false,
    allowedHosts: true,
    fs: {
      allow: [projectRoot, path.resolve(projectRoot, "client")],
      strict: false,
    },
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");

  const serveIndex = async (req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    const p = req.path;
    if (p.startsWith("/api") || p.startsWith("/src") || p.startsWith("/@") || p.startsWith("/node_modules") || p.includes(".")) return next();
    try {
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  };

  app.use(serveIndex);
  app.use(vite.middlewares);
}
