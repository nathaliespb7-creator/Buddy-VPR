import { QueryClient } from "@tanstack/react-query";

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";

export { API_BASE };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
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
