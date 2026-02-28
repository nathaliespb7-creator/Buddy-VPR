/**
 * Типы системы мотивации (звёзды, профиль, Free/Premium).
 * Спецификация: docs/MOTIVATION-AND-STARS.md
 */

import type { AvatarChoice } from "@/components/AvatarPicker";

/** Режим пользователя: песочница (только localStorage) или путь героя (sync). */
export type UserTier = "free" | "premium";

/** Счётчики звёзд. Один источник правды вместо массива. */
export interface StarCounts {
  total: number;
  gold: number;
  silver: number;
}

/** Тип звезды за задание (для пересдачи: обновляем только тип, total не растёт). */
export type StarTypeEarned = "gold" | "silver";

/** Профиль пользователя (новый формат после миграции). */
export interface UserProfile {
  avatar: AvatarChoice;
  tier: UserTier;
  nickname: string | null;
  stars: StarCounts;
  /** Привязка звезды к taskId для пересдачи: при повторном прохождении обновляем только тип. */
  starByTaskId?: Record<string, StarTypeEarned>;
  /** Premium: виртуальный уровень от %. */
  level?: number;
  /** Premium: Новичок | Следопыт | Мастер | Легенда. */
  rank?: string;
  /** Premium: уже показанные ранги (LevelUpModal не спамит). */
  seenRanks?: string[];
}
