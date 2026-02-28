/**
 * Типы API синхронизации прогресса (Premium).
 * Спецификация: docs/MOTIVATION-AND-STARS.md, § 6.
 */

import type { StarCounts } from "./motivation";

/** Тело PATCH /api/user/progress — отправить локальные звёзды на сервер. */
export interface PatchProgressBody {
  stars: StarCounts;
  /** Локальная метка времени (мс) для стратегии слияния. */
  timestamp?: number;
}

/** Ответ PATCH /api/user/progress — сервер сохранил, возвращает свою метку. */
export interface PatchProgressResponse {
  ok: boolean;
  /** Метка времени на сервере (мс); при следующем GET сравнить с локальной. */
  server_timestamp: number;
}

/** Ответ GET /api/user/progress — текущее состояние на сервере. */
export interface GetProgressResponse {
  stars: StarCounts;
  server_timestamp: number;
}

/** Режим слияния при конфликте (server_timestamp > local и разница в totalStars значительная). */
export type MergeStrategy = "local_wins" | "server_wins" | "prompt";

export interface UseProfileSyncOptions {
  /** При конфликте: принять локальные данные, серверные или спросить пользователя. MVP: local_wins. */
  mergeStrategy?: MergeStrategy;
  /** Порог «значительной» разницы в totalStars для срабатывания merge (по умолчанию 1). */
  mergeThresholdStars?: number;
  /** Вызов после успешного PATCH (например обновить локальный server_timestamp). */
  onSyncSuccess?: (response: PatchProgressResponse) => void;
  /** Вызов при ошибке сети (офлайн). */
  onOfflineError?: () => void;
}
