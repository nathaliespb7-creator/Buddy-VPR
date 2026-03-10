/**
 * Обработчик Yandex Cloud Functions (HTTP-триггер).
 * Обёртка над Express: event -> req/res -> { statusCode, headers, body }.
 *
 * Переменные: DATABASE_URL, CORS_ORIGIN (через запятую).
 */
import { Readable } from "stream";
import { createApp } from "./server/app.js";

let appPromise: ReturnType<typeof createApp> | null = null;

function getApp() {
  if (!appPromise) appPromise = createApp({ attachHttpServer: false });
  return appPromise;
}

interface YandexHttpEvent {
  httpMethod?: string;
  url?: string;
  path?: string;
  multiValueQueryStringParameters?: Record<string, string[]>;
  headers?: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  body?: string | null;
  isBase64Encoded?: boolean;
  requestContext?: { http?: { method?: string; path?: string } };
}

interface YandexHttpResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

function getMethod(e: YandexHttpEvent): string {
  return e.httpMethod ?? e.requestContext?.http?.method ?? "GET";
}

function getPath(e: YandexHttpEvent): string {
  const path = e.url ?? e.path ?? e.requestContext?.http?.path ?? "/";
  const q = e.multiValueQueryStringParameters;
  if (!q || Object.keys(q).length === 0) return path;
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    for (const one of v ?? []) search.append(k, one);
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

function getHeaders(e: YandexHttpEvent): Record<string, string> {
  const h: Record<string, string> = { ...e.headers };
  if (e.multiValueHeaders) {
    for (const [k, v] of Object.entries(e.multiValueHeaders)) {
      if (Array.isArray(v) && v.length) h[k.toLowerCase()] = v.join(", ");
    }
  }
  return h;
}

function buildReq(event: YandexHttpEvent): Readable & { method: string; url: string; path: string; headers: Record<string, string> } {
  const body = event.body ?? "";
  const buf = event.isBase64Encoded && body ? Buffer.from(body, "base64") : Buffer.from(body, "utf-8");
  const fullUrl = getPath(event);
  const path = fullUrl.includes("?") ? fullUrl.slice(0, fullUrl.indexOf("?")) : fullUrl;
  const stream = Readable.from([buf]) as Readable & { method: string; url: string; path: string; headers: Record<string, string> };
  stream.method = getMethod(event);
  stream.url = fullUrl;
  stream.path = path;
  stream.headers = getHeaders(event);
  return stream;
}

function buildRes(): {
  res: {
    statusCode: number;
    _headers: Record<string, string>;
    _chunks: Buffer[];
    setHeader: (name: string, value: string | number) => void;
    write: (chunk: string | Buffer) => boolean;
    end: (chunk?: string | Buffer) => void;
    status: (code: number) => void;
    json: (obj: unknown) => void;
    headersSent: boolean;
    writableEnded: boolean;
    on: () => void;
    once: () => void;
  };
  promise: Promise<YandexHttpResponse>;
} {
  const _headers: Record<string, string> = {};
  const _chunks: Buffer[] = [];
  let _resolve: (r: YandexHttpResponse) => void;
  const promise = new Promise<YandexHttpResponse>((resolve) => {
    _resolve = resolve;
  });

  const res = {
    statusCode: 200,
    _headers,
    _chunks,
    headersSent: false,
    writableEnded: false,
    setHeader(name: string, value: string | number) {
      _headers[name.toLowerCase()] = String(value);
      return this;
    },
    write(chunk: string | Buffer) {
      _chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, "utf-8"));
      return true;
    },
    end(chunk?: string | Buffer) {
      if (res.writableEnded) return res;
      res.writableEnded = true;
      res.headersSent = true;
      if (chunk !== undefined) {
        _chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, "utf-8"));
      }
      _resolve!({
        statusCode: res.statusCode,
        headers: Object.keys(_headers).length ? _headers : undefined,
        body: Buffer.concat(_chunks).toString("utf-8"),
      });
      return res;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(obj: unknown) {
      this.setHeader("content-type", "application/json; charset=utf-8");
      return this.end(JSON.stringify(obj));
    },
    on: () => res,
    once: () => res,
  };
  return { res, promise };
}

export async function handler(event: YandexHttpEvent, _context: { requestId?: string }): Promise<YandexHttpResponse> {
  const { app } = await getApp();
  const req = buildReq(event);
  const { res, promise } = buildRes();

  return new Promise((resolve, reject) => {
    const done = (err?: unknown) => {
      if (err) {
        reject(err);
        return;
      }
      if (!res.writableEnded) {
        res.statusCode = res.statusCode || 404;
        res.end(JSON.stringify({ error: "Not Found" }));
      }
    };
    app(req, res as unknown as import("http").ServerResponse, done);
    promise.then(resolve).catch(reject);
  });
}
