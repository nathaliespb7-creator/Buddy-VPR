import { motion } from "framer-motion";
import type { AvatarChoice } from "@/components/AvatarPicker";
import { LevelIcon } from "@/components/LevelIcons";
import type { LevelInfo } from "@/lib/levelSystem";
import { cn } from "@/lib/utils";

interface ProfileSummaryProps {
  avatar: AvatarChoice;
  totalStars: number;
  levelInfo: LevelInfo;
}

function starsToNextLabel(totalStars: number, levelInfo: LevelInfo): string {
  if (levelInfo.nextLevelThreshold == null) {
    return "Ты на максимальном уровне. Делись победами с друзьями!";
  }
  const remaining = Math.max(0, levelInfo.nextLevelThreshold - totalStars);
  if (remaining === 0) {
    return "Ещё чуть-чуть, и новый уровень откроется после следующей звезды!";
  }
  const word =
    remaining % 10 === 1 && remaining % 100 !== 11
      ? "звезду"
      : [2, 3, 4].includes(remaining % 10) && ![12, 13, 14].includes(remaining % 100)
      ? "звезды"
      : "звёзд";

  return `Осталось ${remaining} ${word} до следующего уровня!`;
}

export function ProfileSummary({ avatar, totalStars, levelInfo }: ProfileSummaryProps) {
  const label = starsToNextLabel(totalStars, levelInfo);

  return (
    <section className="w-full px-4 sm:px-6 pt-3 pb-1">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full max-w-2xl mx-auto rounded-2xl border border-emerald-200/70 dark:border-emerald-700/70",
          "bg-emerald-50/70 dark:bg-emerald-900/20 px-3 sm:px-4 py-3 flex items-center gap-3 sm:gap-4"
        )}
      >
        <div className="shrink-0 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-emerald-900/40 w-12 h-12 sm:w-14 sm:h-14 text-2xl text-emerald-700 dark:text-emerald-200">
          <LevelIcon level={levelInfo.level} size="lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Уровень {levelInfo.level}
              </p>
              <p className="text-sm sm:text-base font-bold text-emerald-900 dark:text-emerald-50 truncate">
                {levelInfo.title}
              </p>
            </div>
            <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-100/80 font-medium whitespace-nowrap">
              ⭐ {totalStars} всего
            </p>
          </div>
          <div className="mt-2 space-y-1">
            <div className="w-full h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-900/80 dark:text-emerald-100/80">
              {label}
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

