export interface LevelInfo {
  level: number;
  title: string;
  emoji: string;
  nextLevelThreshold: number | null;
  progressPercent: number;
}

interface LevelConfig {
  level: number;
  min: number;
  max?: number;
  title: string;
  emoji: string;
}

const LEVELS: LevelConfig[] = [
  { level: 1, min: 0, max: 50, title: "Искатель", emoji: "🌱" },
  { level: 2, min: 51, max: 200, title: "Следопыт", emoji: "🗺️" },
  { level: 3, min: 201, max: 500, title: "Хранитель", emoji: "📚" },
  { level: 4, min: 501, max: 1000, title: "Магистр", emoji: "🎓" },
  { level: 5, min: 1001, max: 2999, title: "Легенда", emoji: "👑" },
  { level: 6, min: 3000, title: "Бадди-Герой", emoji: "🦸‍️" },
];

export function calculateLevel(totalStars: number): LevelInfo {
  const stars = Math.max(0, Math.floor(totalStars || 0));
  let current = LEVELS[0];

  for (const cfg of LEVELS) {
    if (stars >= cfg.min && (cfg.max === undefined || stars <= cfg.max)) {
      current = cfg;
    }
  }

  const currentIdx = LEVELS.findIndex(l => l.level === current.level);
  const nextCfg = LEVELS[currentIdx + 1];

  if (!nextCfg) {
    return {
      level: current.level,
      title: `${current.title}`,
      emoji: current.emoji,
      nextLevelThreshold: null,
      progressPercent: 100,
    };
  }

  const span = nextCfg.min - current.min;
  const progress =
    span > 0 ? Math.max(0, Math.min(100, ((stars - current.min) / span) * 100)) : 0;

  return {
    level: current.level,
    title: current.title,
    emoji: current.emoji,
    nextLevelThreshold: nextCfg.min,
    progressPercent: Math.round(progress),
  };
}

