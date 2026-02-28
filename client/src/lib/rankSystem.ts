/**
 * Адаптивная система рангов (Premium).
 * Ранг считается от процента: starsTotal / moduleCapacity.
 * Спецификация: docs/MOTIVATION-AND-STARS.md, § 5.
 */

const RANK_THRESHOLDS: { maxPercent: number; rank: string }[] = [
  { maxPercent: 20, rank: "Новичок" },
  { maxPercent: 50, rank: "Следопыт" },
  { maxPercent: 80, rank: "Мастер" },
  { maxPercent: 100, rank: "Легенда" },
];

export interface RankInfo {
  /** Название ранга или null в Free (capacity неизвестен). */
  rank: string | null;
  /** Процент прогресса 0–100 или null в Free. */
  progressPercent: number | null;
  /** Процент до следующего ранга (20 | 50 | 80) или null, если уже Легенда. */
  nextRankThresholdPercent: number | null;
}

/**
 * Возвращает ранг и прогресс по числу звёзд и ёмкости курса.
 * Free (moduleCapacity === null): rank и progress null — UI скрывает прогресс-бар.
 * Premium: percent = (starsTotal / moduleCapacity) * 100, ранг по таблице.
 */
export function getRankInfo(starsTotal: number, moduleCapacity: number | null): RankInfo {
  if (moduleCapacity === null || moduleCapacity <= 0) {
    return {
      rank: null,
      progressPercent: null,
      nextRankThresholdPercent: null,
    };
  }

  const progressPercent = Math.min(100, Math.max(0, (starsTotal / moduleCapacity) * 100));

  for (let i = 0; i < RANK_THRESHOLDS.length; i++) {
    const { maxPercent, rank } = RANK_THRESHOLDS[i];
    if (progressPercent < maxPercent) {
      const nextThreshold = rank === "Легенда" ? null : maxPercent;
      return {
        rank,
        progressPercent: Math.round(progressPercent * 10) / 10,
        nextRankThresholdPercent: nextThreshold,
      };
    }
  }

  // Ровно 100% — Легенда, следующего ранга нет
  return {
    rank: "Легенда",
    progressPercent: Math.round(progressPercent * 10) / 10,
    nextRankThresholdPercent: null,
  };
}
