import { QueryClient } from "@tanstack/react-query";

/** Базовый URL API. На Vercel без бэкенда — пустая строка (same-origin). */
export const API_BASE = typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, "")
  : "";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export type ApiRequestOptions = Record<string, unknown> | undefined;

/**
 * Вызов API: fetch с JSON и credentials.
 * Используется для мутаций (например отправка ответа на задание).
 */
export async function apiRequest<T = unknown>(
  method: string,
  path: string,
  data?: ApiRequestOptions
): Promise<T> {
  const url = API_BASE + path;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...(data !== undefined && { body: JSON.stringify(data) }),
  });
  if (!res.ok) {
    throw new Error(`API ${method} ${path}: ${res.status}`);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`API ${path}: invalid JSON`);
  }
}
