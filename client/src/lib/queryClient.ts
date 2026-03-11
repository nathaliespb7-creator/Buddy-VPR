import { QueryClient, QueryFunction } from "@tanstack/react-query";

/** Базовый URL API.
 * - В dev и при одном origin — пусто.
 * - Для внешнего бэкенда (Yandex Cloud, Railway и т.п.) задаём полный HTTP URL.
 * - Значения вида "/api" теперь игнорируются, чтобы не получать "/api/api/*". */
const RAW_API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

let normalizedApiBase = RAW_API_BASE.trim();
if (!normalizedApiBase) {
  normalizedApiBase = "";
} else if (normalizedApiBase.startsWith("/api")) {
  normalizedApiBase = "";
} else if (normalizedApiBase.startsWith("http")) {
  normalizedApiBase = normalizedApiBase.replace(/\/$/, "");
} else {
  normalizedApiBase = "";
}

export const API_BASE = normalizedApiBase;

const CREDENTIALS_MODE: RequestCredentials =
  API_BASE && API_BASE.startsWith("http") ? "omit" : "include";

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
    credentials: CREDENTIALS_MODE,
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
      credentials: CREDENTIALS_MODE,
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
