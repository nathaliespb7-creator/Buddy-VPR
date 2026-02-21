import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "./Mascot";
import { Star, DoorOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export type StarType = "gold" | "silver" | "empty";

interface HeaderProps {
  mascotMood: "idle" | "happy" | "thinking" | "celebrating" | "encouraging" | "wrong" | "hint";
  stars: StarType[];
  onExit?: () => void;
  overallProgress?: number;
}

function ProgressRing({ progress }: { progress: number }) {
  const size = 56;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const isComplete = progress >= 100;

  const strokeColor =
    isComplete
      ? "#f59e0b"
      : progress >= 60
        ? "#10b981"
        : progress >= 30
          ? "#38bdf8"
          : "#94a3b8";

  const bgTrack = isComplete ? "rgba(245,158,11,0.15)" : "rgba(148,163,184,0.15)";

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgTrack}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {isComplete ? (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
          >
            <Trophy className="w-5 h-5 text-amber-400 fill-amber-400" />
          </motion.div>
        ) : (
          <span
            className="text-base font-bold tabular-nums leading-none"
            style={{ color: strokeColor }}
            data-testid="text-overall-pct"
          >
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
}

export function Header({ mascotMood, stars, onExit, overallProgress }: HeaderProps) {
  const goldCount = stars.filter(s => s === "gold").length;
  const silverCount = stars.filter(s => s === "silver").length;

  return (
    <header className="w-full py-2.5 sm:py-3 px-3 sm:px-6 border-b border-border/60 bg-background/95 font-sans antialiased" data-testid="header">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 min-h-[52px] sm:min-h-[56px]">
        {/* Логотип и название — единая типографическая шкала (дизайн-система: H2 22–24px, подпись 14–16px) */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="shrink-0 flex items-center justify-center"
          >
            <Mascot mood={mascotMood} size="sm" />
          </motion.div>
          <div className="min-w-0">
            <h1
              className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-tight"
              data-testid="text-app-title"
            >
              Бадди ВПР
            </h1>
            <p
              className="text-sm sm:text-base text-muted-foreground font-normal leading-snug mt-0.5"
              data-testid="text-subtitle"
            >
              Умный помощник для подготовки
            </p>
          </div>
        </div>

        {/* Прогресс и звёзды — не мельче 14px (подписи/hint по дизайн-системе) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0" data-testid="header-stats">
          {overallProgress !== undefined && (
            <div className="flex items-center justify-center" data-testid="overall-progress-widget">
              <ProgressRing progress={overallProgress} />
            </div>
          )}

          <div className="flex items-center gap-2.5" data-testid="star-counter">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400 drop-shadow-sm" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={goldCount}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm font-bold tabular-nums text-foreground min-w-[1.25rem] text-left"
                  data-testid="text-gold-count"
                >
                  {goldCount}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-300 text-slate-400" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={silverCount}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm font-bold tabular-nums text-muted-foreground min-w-[1.25rem] text-left"
                  data-testid="text-silver-count"
                >
                  {silverCount}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Кнопка «Выход» — крупная, с подписью (понятно детям) */}
          {onExit && (
            <Button
              variant="ghost"
              onClick={onExit}
              className="shrink-0 h-12 px-3 sm:px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-amber-100/80 dark:hover:bg-amber-900/30 hover:border hover:border-amber-200/80 dark:hover:border-amber-700/50 border border-transparent transition-colors gap-2 font-semibold text-sm sm:text-base min-h-[48px]"
              aria-label="Выход из приложения"
              data-testid="button-exit"
            >
              <DoorOpen className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] shrink-0" aria-hidden />
              <span>Выход</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
