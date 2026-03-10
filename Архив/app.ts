/**
 * Фабрика Express-приложения для API (без listen).
 * Используется локально (server/index.ts) и в Yandex Cloud Functions (index.handler.ts).
 */
import "dotenv/config";
import express, { type Express, type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { registerRoutes } from "./routes";
import { seedDatabase } from "./seed";

declare module "http" {
  interface IncomingMessage {
    rawBody?: Buffer;
  }
}

export function log(message: string, source = "express") {
  const t = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  console.log(`${t} [${source}] ${message}`);
}

function getCorsOrigins(): string[] {
  const env = process.env.CORS_ORIGIN ?? "";
  if (!env.trim()) {
    return [
      "https://buddyvpr.ru",
      "https://www.buddyvpr.ru",
      "https://buddyvpr.vercel.app",
    ];
  }
  return env.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function createApp(options?: { attachHttpServer?: boolean }): Promise<{ app: Express; httpServer?: Server }> {
  const app = express();
  const httpServer = options?.attachHttpServer !== false ? createServer(app) : undefined;

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJson: Record<string, unknown> | undefined;
    const origJson = res.json.bind(res);
    res.json = (body: unknown) => {
      capturedJson = body as Record<string, unknown>;
      return origJson(body);
    };
    res.on("finish", () => {
      if (path.startsWith("/api")) {
        const duration = Date.now() - start;
        let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJson) line += ` :: ${JSON.stringify(capturedJson)}`;
        log(line);
      }
    });
    next();
  });

  const allowedOrigins = getCorsOrigins();
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    next();
  });

  await seedDatabase();
  await registerRoutes(httpServer ?? null, app);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as { status?: number }).status ?? 500;
    const message = (err as Error).message ?? "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  return { app, httpServer };
}
