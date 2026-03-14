/**
 * Предметно-ориентированное хранилище: профиль (аватар, tier) и звёзды по предмету.
 * Ключи: buddy_profile (база), buddy_stars_{subjectId}, buddy_progress_{subjectId}.
 */

import type { UserProfile, StarCounts } from "@/types/motivation";
import type { AvatarChoice } from "@/components/AvatarPicker";
import { migrateProfile } from "@/lib/profileMigration";
import type { SubjectId } from "@/data/subjectsConfig";

const PROFILE_BASE_KEY = "buddy_profile";
const STARS_KEY_PREFIX = "buddy_stars_";
const PROGRESS_KEY_PREFIX = "buddy_progress_";

export function getStarsKey(subjectId: SubjectId): string {
  return STARS_KEY_PREFIX + subjectId;
}

export function getProgressKey(subjectId: SubjectId): string {
  return PROGRESS_KEY_PREFIX + subjectId;
}

/** Читает только базу профиля (аватар, tier, nickname) из localStorage. */
function getProfileBase(): { avatar: AvatarChoice; tier: "free" | "premium"; nickname: string | null } | null {
  try {
    const raw = localStorage.getItem(PROFILE_BASE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      avatar: parsed.avatar ?? "buddy",
      tier: parsed.tier === "premium" ? "premium" : "free",
      nickname: typeof parsed.nickname === "string" ? parsed.nickname : null,
    };
  } catch {
    return null;
  }
}

/** Читает звёзды для предмета из buddy_stars_{subjectId}. */
function getStoredStars(subjectId: SubjectId): StarCounts & { starByTaskId?: Record<string, "gold" | "silver"> } | null {
  try {
    const raw = localStorage.getItem(getStarsKey(subjectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.total !== "number") return null;
    return {
      total: parsed.total ?? 0,
      gold: parsed.gold ?? 0,
      silver: parsed.silver ?? 0,
      starByTaskId: typeof parsed.starByTaskId === "object" && parsed.starByTaskId ? parsed.starByTaskId : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Возвращает профиль для текущего предмета: база (аватар, tier, nickname) + звёзды по subjectId.
 * Поддерживает старый формат: если в buddy_profile ещё лежат stars — мигрируем и используем для russian.
 */
export function getStoredProfile(subjectId: SubjectId): UserProfile | null {
  const base = getProfileBase();
  const starsForSubject = getStoredStars(subjectId);

  // Один раз мигрируем старый buddy_profile (со звёздами внутри) в базу + buddy_stars_russian
  if (!starsForSubject && subjectId === "russian") {
    try {
      const raw = localStorage.getItem(PROFILE_BASE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.stars != null || parsed.totalStars != null)) {
          const migrated = migrateProfile(parsed);
          if (migrated.stars.total > 0 || Object.keys(migrated.starByTaskId ?? {}).length > 0) {
            saveStars("russian", migrated.stars, migrated.starByTaskId);
            if (!base) {
              const { avatar, tier, nickname } = migrated;
              saveProfileBase({ avatar, tier, nickname });
            }
            return migrated;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  if (!base && !starsForSubject) return null;

  const stars: StarCounts = starsForSubject
    ? { total: starsForSubject.total, gold: starsForSubject.gold, silver: starsForSubject.silver }
    : { total: 0, gold: 0, silver: 0 };
  const starByTaskId = starsForSubject?.starByTaskId;

  return {
    avatar: base?.avatar ?? "buddy",
    tier: base?.tier ?? "free",
    nickname: base?.nickname ?? null,
    stars,
    starByTaskId,
  };
}

function saveProfileBase(base: { avatar: AvatarChoice; tier: "free" | "premium"; nickname: string | null }): void {
  try {
    localStorage.setItem(PROFILE_BASE_KEY, JSON.stringify(base));
  } catch {
    // ignore
  }
}

function saveStars(subjectId: SubjectId, stars: StarCounts, starByTaskId?: Record<string, "gold" | "silver">): void {
  try {
    localStorage.setItem(
      getStarsKey(subjectId),
      JSON.stringify({ ...stars, starByTaskId: starByTaskId ?? {} })
    );
  } catch {
    // ignore
  }
}

/** Сохраняет профиль: базу в buddy_profile и звёзды в buddy_stars_{subjectId}. */
export function saveProfile(profile: UserProfile, subjectId: SubjectId): void {
  saveProfileBase({
    avatar: profile.avatar,
    tier: profile.tier,
    nickname: profile.nickname,
  });
  saveStars(subjectId, profile.stars, profile.starByTaskId);
}

/** Читает/пишет прогресс по предмету (для будущего использования, например последний раунд). */
export function getStoredProgress(subjectId: SubjectId): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(getProgressKey(subjectId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

export function saveProgress(subjectId: SubjectId, data: Record<string, unknown>): void {
  try {
    localStorage.setItem(getProgressKey(subjectId), JSON.stringify(data));
  } catch {
    // ignore
  }
}
