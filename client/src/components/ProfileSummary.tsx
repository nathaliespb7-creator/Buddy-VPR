import { motion } from "framer-motion";
import type { AvatarChoice } from "@/components/AvatarPicker";
import type { RankInfo } from "@/lib/rankSystem";
import { cn } from "@/lib/utils";

interface ProfileSummaryProps {
  avatar: AvatarChoice;
  totalStars: number;
  /** Premium: ранг и прогресс. Free: null — показываем только счётчик звёзд. */
  rankInfo: RankInfo | null;
  /** Для подписи «N из M звёзд» (только при rankInfo !== null). */
  moduleCapacity: number | null;
}

function progressLabel(
  totalStars: number,
  rankInfo: RankInfo,
  moduleCapacity: number | null
): string {
  if (rankInfo.rank === "Легенда" || rankInfo.nextRankThresholdPercent == null) {
    return "Ты — Легенда! Делись победами с друзьями!";
  }
  const percentLeft = rankInfo.nextRankThresholdPercent - (rankInfo.progressPercent ?? 0);
  if (moduleCapacity != null && moduleCapacity > 0) {
    const starsLeft = Math.ceil((percentLeft / 100) * moduleCapacity);
    if (starsLeft <= 0) return "Ещё чуть-чуть до следующего ранга!";
    const word =
      starsLeft % 10 === 1 && starsLeft % 100 !== 11
        ? "звезду"
        : [2, 3, 4].includes(starsLeft % 10) && ![12, 13, 14].includes(starsLeft % 100)
          ? "звезды"
          : "звёзд";
    return `Осталось ${starsLeft} ${word} до следующего ранга`;
  }
  return `Осталось ${Math.round(percentLeft)}% до следующего ранга`;
}

export function ProfileSummary({ avatar, totalStars, rankInfo, moduleCapacity }: ProfileSummaryProps) {
  const showRankBlock = rankInfo?.rank != null && rankInfo.progressPercent != null;

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
        {showRankBlock ? (
          <>
            <div className="shrink-0 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-emerald-900/40 w-12 h-12 sm:w-14 sm:h-14 text-2xl text-emerald-700 dark:text-emerald-200 font-bold">
              {rankInfo.rank === "Легенда" ? "👑" : rankInfo.rank === "Мастер" ? "🎓" : rankInfo.rank === "Следопыт" ? "🗺️" : "🌱"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                    Ранг
                  </p>
                  <p className="text-sm sm:text-base font-bold text-emerald-900 dark:text-emerald-50 truncate">
                    {rankInfo.rank}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-100/80 font-medium whitespace-nowrap">
                  ⭐ {totalStars}
                  {moduleCapacity != null && moduleCapacity > 0 ? ` из ${moduleCapacity}` : ""} всего
                </p>
              </div>
              <div className="mt-2 space-y-1">
                <div className="w-full h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all"
                    style={{ width: `${rankInfo.progressPercent ?? 0}%` }}
                  />
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-900/80 dark:text-emerald-100/80">
                  {progressLabel(totalStars, rankInfo, moduleCapacity)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-100">
              Смотри, сколько звёзд ты собрал!
            </p>
            <p className="text-lg font-bold text-emerald-900 dark:text-emerald-50 whitespace-nowrap">
              ⭐ {totalStars} всего
            </p>
          </div>
        )}
      </motion.div>
    </section>
  );
}
