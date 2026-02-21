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
  /** На мобильном: только «Назад» + тонкий прогресс-бар (экран задания) */
  variant?: "full" | "task";
  taskProgress?: { current: number; total: number };
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

export function Header({ mascotMood, stars, onExit, overallProgress, variant = "full", taskProgress }: HeaderProps) {
  const goldCount = stars.filter(s => s === "gold").length;
  const silverCount = stars.filter(s => s === "silver").length;
  const isTaskVariant = variant === "task" && taskProgress;

  if (isTaskVariant) {
    const { current, total } = taskProgress;
    const percent = total > 0 ? Math.round((current / total) * 100) : 0;
    return (
      <>
        {/* Мобильный: только прогресс-линия и «Назад» */}
        <header
          className="w-full border-b border-border/60 bg-background/95 shrink-0 sm:hidden"
          style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
          data-testid="header"
        >
          <div className="px-4 pt-0.5">
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${percent}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between px-2 py-2 min-h-[44px]">
            {onExit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
                className="gap-1 text-muted-foreground hover:text-foreground -ml-2 min-h-[44px] touch-manipulation"
                aria-label="Назад"
                data-testid="button-exit"
              >
                <DoorOpen className="w-5 h-5 shrink-0" aria-hidden />
                <span className="text-sm font-medium">Назад</span>
              </Button>
            )}
            <span className="text-xs font-medium text-muted-foreground tabular-nums" data-testid="text-task-progress">
              {current} из {total}
            </span>
            {!onExit && <div className="w-14" />}
          </div>
        </header>
        {/* Десктоп: полная шапка */}
        <header className="w-full py-2.5 sm:py-3 px-3 sm:px-6 border-b border-border/60 bg-background/95 font-sans antialiased shrink-0 hidden sm:block" style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }} data-testid="header-desktop">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 sm:gap-3 min-h-[48px] sm:min-h-[56px]">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} className="shrink-0 flex items-center justify-center">
                <Mascot mood={mascotMood} size="sm" />
              </motion.div>
              <div className="min-w-0 overflow-hidden">
                <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight leading-tight truncate" data-testid="text-app-title">Бадди ВПР</h1>
                <p className="text-sm sm:text-base text-muted-foreground font-normal leading-snug mt-0.5" data-testid="text-subtitle">Умный помощник для подготовки</p>
              </div>
            </div>
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
                    <motion.span key={goldCount} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }} className="text-sm font-bold tabular-nums text-foreground min-w-[1.25rem] text-left" data-testid="text-gold-count">{goldCount}</motion.span>
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-300 text-slate-400" />
                  <AnimatePresence mode="wait">
                    <motion.span key={silverCount} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }} className="text-sm font-bold tabular-nums text-muted-foreground min-w-[1.25rem] text-left" data-testid="text-silver-count">{silverCount}</motion.span>
                  </AnimatePresence>
                </div>
              </div>
              {onExit && (
                <Button variant="ghost" onClick={onExit} className="shrink-0 h-12 px-3 sm:px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-amber-100/80 dark:hover:bg-amber-900/30 hover:border hover:border-amber-200/80 dark:hover:border-amber-700/50 border border-transparent transition-colors gap-2 font-semibold text-sm sm:text-base min-h-[48px]" aria-label="Выход из приложения" data-testid="button-exit">
                  <DoorOpen className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] shrink-0" aria-hidden />
                  <span>Выход</span>
                </Button>
              )}
            </div>
          </div>
        </header>
      </>
    );
  }

  // Полная шапка — только на десктопе (sm+)
  const fullHeader = (
    <header className="w-full py-2.5 sm:py-3 px-3 sm:px-6 border-b border-border/60 bg-background/95 font-sans antialiased shrink-0 hidden sm:block" style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }} data-testid="header-desktop">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 sm:gap-3 min-h-[48px] sm:min-h-[56px]">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} className="shrink-0 flex items-center justify-center">
            <Mascot mood={mascotMood} size="sm" />
          </motion.div>
          <div className="min-w-0 overflow-hidden">
            <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight leading-tight truncate" data-testid="text-app-title">Бадди ВПР</h1>
            <p className="text-sm sm:text-base text-muted-foreground font-normal leading-snug mt-0.5" data-testid="text-subtitle">Умный помощник для подготовки</p>
          </div>
        </div>
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
                <motion.span key={goldCount} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }} className="text-sm font-bold tabular-nums text-foreground min-w-[1.25rem] text-left" data-testid="text-gold-count">{goldCount}</motion.span>
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-300 text-slate-400" />
              <AnimatePresence mode="wait">
                <motion.span key={silverCount} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }} className="text-sm font-bold tabular-nums text-muted-foreground min-w-[1.25rem] text-left" data-testid="text-silver-count">{silverCount}</motion.span>
              </AnimatePresence>
            </div>
          </div>
          {onExit && (
            <Button variant="ghost" onClick={onExit} className="shrink-0 h-12 px-3 sm:px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-amber-100/80 dark:hover:bg-amber-900/30 hover:border hover:border-amber-200/80 dark:hover:border-amber-700/50 border border-transparent transition-colors gap-2 font-semibold text-sm sm:text-base min-h-[48px]" aria-label="Выход из приложения" data-testid="button-exit">
              <DoorOpen className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] shrink-0" aria-hidden />
              <span>Выход</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );

  // Мобильный: минимальная полоса (выбор режима, карта островов и т.д.) — только логотип-название + Выход
  const mobileCompactHeader = (
    <header
      className="w-full border-b border-border/60 bg-background/95 shrink-0 sm:hidden"
      style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      data-testid="header"
    >
      <div className="flex items-center justify-between px-4 py-2 min-h-[44px]">
        <h1 className="text-base font-bold text-foreground truncate" data-testid="text-app-title">Бадди ВПР</h1>
        {onExit ? (
          <Button variant="ghost" size="sm" onClick={onExit} className="gap-1 text-muted-foreground hover:text-foreground -mr-2 min-h-[44px] touch-manipulation" aria-label="Выход" data-testid="button-exit">
            <DoorOpen className="w-5 h-5 shrink-0" aria-hidden />
            <span className="text-sm font-medium">Выход</span>
          </Button>
        ) : (
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold tabular-nums">{goldCount}</span>
            <Star className="w-4 h-4 fill-slate-300 text-slate-400" />
            <span className="text-sm font-bold tabular-nums text-muted-foreground">{silverCount}</span>
          </div>
        )}
      </div>
    </header>
  );

  return (
    <>
      {mobileCompactHeader}
      {fullHeader}
    </>
  );
}
