/**
 * Миграция профиля со старого формата (stars: StarType[], totalStars) на новый (stars: StarCounts).
 * Спецификация: docs/MOTIVATION-AND-STARS.md, Фаза 1.
 */

import type { UserProfile, StarCounts, UserTier } from "@/types/motivation";
import type { AvatarChoice } from "@/components/AvatarPicker";

/** Старый формат: массив звёзд и опционально totalStars. */
type StarType = "gold" | "silver" | "empty";

/** Профиль в старом формате (localStorage до миграции). */
export interface LegacyUserProfile {
  avatar?: AvatarChoice;
  stars: StarType[];
  totalStars?: number;
  level?: number;
}

function isStarCounts(stars: unknown): stars is StarCounts {
  return (
    typeof stars === "object" &&
    stars !== null &&
    "total" in stars &&
    "gold" in stars &&
    "silver" in stars &&
    typeof (stars as StarCounts).total === "number" &&
    typeof (stars as StarCounts).gold === "number" &&
    typeof (stars as StarCounts).silver === "number"
  );
}

function isLegacyStars(stars: unknown): stars is StarType[] {
  return Array.isArray(stars) && stars.every((s) => s === "gold" || s === "silver" || s === "empty");
}

/**
 * Конвертирует старый профиль в новый формат.
 * Если передан уже новый формат (stars — объект { total, gold, silver }) — возвращает как есть.
 */
export function migrateProfile(parsed: LegacyUserProfile | UserProfile | null | undefined): UserProfile {
  const defaultProfile: UserProfile = {
    avatar: "buddy",
    tier: "free",
    nickname: null,
    stars: { total: 0, gold: 0, silver: 0 },
  };

  if (!parsed || typeof parsed !== "object") {
    return defaultProfile;
  }

  const avatar: AvatarChoice =
    parsed.avatar === "cat" || parsed.avatar === "robot" || parsed.avatar === "astronaut"
      ? parsed.avatar
      : "buddy";

  // Уже новый формат
  if (isStarCounts(parsed.stars)) {
    return {
      avatar,
      tier: (parsed as UserProfile).tier ?? "free",
      nickname: (parsed as UserProfile).nickname ?? null,
      stars: parsed.stars,
      starByTaskId: (parsed as UserProfile).starByTaskId,
      level: (parsed as UserProfile).level,
      rank: (parsed as UserProfile).rank,
      seenRanks: (parsed as UserProfile).seenRanks,
    };
  }

  // Старый формат: stars — массив StarType[]
  if (isLegacyStars(parsed.stars)) {
    const gold = parsed.stars.filter((s) => s === "gold").length;
    const silver = parsed.stars.filter((s) => s === "silver").length;
    const rawTotal = (parsed as LegacyUserProfile).totalStars;
    const total: number = typeof rawTotal === "number" ? rawTotal : parsed.stars.length;

    const stars: StarCounts = {
      total,
      gold,
      silver,
    };

    return {
      avatar,
      tier: "free",
      nickname: null,
      stars,
      // starByTaskId не восстанавливаем из старого формата — пересдача только для новых прохождений
    };
  }

  // Неожиданная структура — возвращаем дефолт с сохранением avatar
  return {
    ...defaultProfile,
    avatar,
  };
}
