/**
 * Хук синхронизации профиля (звёзд) с сервером в режиме Premium.
 * Спецификация: docs/MOTIVATION-AND-STARS.md, Фаза 4.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest, API_BASE } from "@/lib/queryClient";
import type { UserProfile, StarCounts } from "@/types/motivation";
import type {
  PatchProgressBody,
  PatchProgressResponse,
  GetProgressResponse,
  UseProfileSyncOptions,
} from "@/types/profileSync";

const PROGRESS_URL = "/api/user/progress";

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError && err.message?.includes("fetch")) return true;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("network") ||
      msg.includes("failed to fetch") ||
      msg.includes("load failed") ||
      msg.includes("aborted")
    );
  }
  return false;
}

export interface UseProfileSyncResult {
  /** Есть несинхронизированные изменения (офлайн или ошибка). */
  isPendingSync: boolean;
  /** Повторить отправку на сервер (например после появления сети). */
  retrySync: () => Promise<void>;
  /** Последняя ошибка запроса (для отображения). */
  lastError: Error | null;
}

/**
 * Синхронизирует звёзды профиля с сервером при tier === 'premium'.
 * При изменении stars делает PATCH. При ошибке сети выставляет isPendingSync.
 * MVP: стратегия слияния не реализована — всегда отправляем локальные данные.
 */
export function useProfileSync(
  profile: UserProfile | null,
  options: UseProfileSyncOptions = {}
): UseProfileSyncResult {
  const {
    mergeStrategy: _mergeStrategy = "local_wins", // MVP: зарезервировано для слияния при GET
    onSyncSuccess,
    onOfflineError,
  } = options;

  const [isPendingSync, setIsPendingSync] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const lastSyncedRef = useRef<string>("");
  const isMountedRef = useRef(true);

  const serializeStars = (s: StarCounts) => `${s.total}-${s.gold}-${s.silver}`;

  const sendToServer = useCallback(
    async (stars: StarCounts) => {
      const body: PatchProgressBody = {
        stars,
        timestamp: Date.now(),
      };
      try {
        const res = await apiRequest("PATCH", PROGRESS_URL, body);
        const data = (await res.json()) as PatchProgressResponse;
        if (isMountedRef.current) {
          lastSyncedRef.current = serializeStars(stars);
          setIsPendingSync(false);
          setLastError(null);
          onSyncSuccess?.(data);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        setLastError(err instanceof Error ? err : new Error(String(err)));
        if (isNetworkError(err)) {
          setIsPendingSync(true);
          onOfflineError?.();
        }
      }
    },
    [onSyncSuccess, onOfflineError]
  );

  // При изменении профиля (stars) в premium — PATCH
  useEffect(() => {
    if (!profile || profile.tier !== "premium") {
      return;
    }
    const key = serializeStars(profile.stars);
    if (key === lastSyncedRef.current) {
      return;
    }
    sendToServer(profile.stars);
  }, [profile?.tier, profile?.stars?.total, profile?.stars?.gold, profile?.stars?.silver, sendToServer]);

  // Повторная попытка (например при возврате сети)
  const retrySync = useCallback(async () => {
    if (!profile || profile.tier !== "premium" || !isPendingSync) return;
    await sendToServer(profile.stars);
  }, [profile, isPendingSync, sendToServer]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { isPendingSync, retrySync, lastError };
}

/** GET прогресса с сервера (для стратегии слияния при входе в Premium). */
export async function fetchProgress(): Promise<GetProgressResponse | null> {
  try {
    const res = await fetch(API_BASE + PROGRESS_URL, { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as GetProgressResponse;
    return data;
  } catch {
    return null;
  }
}
