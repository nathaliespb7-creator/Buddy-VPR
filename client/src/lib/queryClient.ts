import { QueryClient, QueryFunction } from "@tanstack/react-query";

/** Базовый URL API (для деплоя фронта отдельно от бэкенда).
 * - В dev и при одном origin — пусто.
 * - В Vercel обычно задаётся `/api` через VITE_API_URL.
 * - Чтобы избежать дубля `/api/api/*`, значения `/api` и `/api/` считаем "пустыми". */
const RAW_API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

let normalizedBase = RAW_API_BASE.trim();
if (!normalizedBase || normalizedBase === "/api" || normalizedBase === "/api/") {
  normalizedBase = "";
} else if (normalizedBase.endsWith("/")) {
  normalizedBase = normalizedBase.slice(0, -1);
}

export const API_BASE = normalizedBase;

const FETCH_TIMEOUT_MS = 15000;

function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timeoutId)
  );
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetchWithTimeout(API_BASE + url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const res = await fetchWithTimeout(API_BASE + url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
