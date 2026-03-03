import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "./Mascot";
import { Star, DoorOpen, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimationSettings } from "@/components/AnimationSettings";
import { useSettings } from "@/context/SettingsContext";
import type { RankInfo } from "@/lib/rankSystem";
import type { StarCounts } from "@/types/motivation";

export type StarType = "gold" | "silver" | "empty";

interface HeaderProps {
  mascotMood: "idle" | "happy" | "thinking" | "celebrating" | "encouraging" | "wrong" | "hint";
  stars: StarCounts;
  onExit?: () => void;
  overallProgress?: number;
  variant?: "full" | "task";
  taskProgress?: { current: number; total: number };
  rankInfo?: RankInfo | null;
  exitLabel?: string;
  timerRemainingSeconds?: number | null;
}

function ParentDashboardLink({ className, size, children }: { className?: string; size?: "default" | "sm" | "lg" | "icon"; children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  return (
    <Button variant="ghost" size={size} onClick={() => setLocation("/parent")} className={className} aria-label="Кабинет родителя" data-testid="button-parent-dashboard">
      {children}
    </Button>
  );
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

function TaskProgressBar({ current, total }: { current: number; total: number }) {
  const progressPercent = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
      <div
        className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Вопрос ${current} из ${total}`}
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          style={{ width: `${progressPercent}%` }}
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-[11px] sm:text-xs text-muted-foreground text-center tabular-nums" data-testid="text-task-progress">
        {current} из {total}
      </span>
    </div>
  );
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Header({ mascotMood, stars, onExit, overallProgress, variant = "full", taskProgress, rankInfo, exitLabel = "Выход", timerRemainingSeconds = null }: HeaderProps) {
  const goldCount = stars.gold;
  const silverCount = stars.silver;
  const isTaskVariant = variant === "task" && taskProgress;
  const { showAnimationControls } = useSettings();
  const correctCount = goldCount + silverCount;

  if (isTaskVariant) {
    const { current, total } = taskProgress;
    return (
      <>
        {/* Мобильный вариант */}
        <header
          className="w-full border-b border-border/60 bg-background/95 shrink-0 sm:hidden"
          style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
          data-testid="header"
        >
          <div className="px-4 pt-1.5 pb-1">
            <TaskProgressBar current={current} total={total} />
            {timerRemainingSeconds != null && timerRemainingSeconds >= 0 && (
              <p className="text-[11px] text-muted-foreground mt-1 text-center tabular-nums" data-testid="text-timer-mobile" aria-live="polite">
                Осталось {formatTimer(timerRemainingSeconds)}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 px-2 pt-2 pb-2 min-h-[44px]">
            {onExit ? (
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
            ) : (
              <div className="w-[3rem]" />
            )}
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="shrink-0 flex items-center justify-center"
            >
              <Mascot mood={mascotMood} size="sm" className="w-10 h-10" />
            </motion.div>
          </div>
          {showAnimationControls && (
            <div className="px-4 pb-2 pt-0 border-t border-border/40">
              <AnimationSettings />
            </div>
          )}
        </header>
        
        {/* Десктопный вариант */}
        <header className="w-full py-2.5 sm:py-3 px-3 sm:px-6 border-b border-border/60 bg-background/95 font-sans antialiased shrink-0 hidden sm:block" style={{ paddingTop: "max(0.625rem, env(safe-area-inset-top))" }} data-testid="header-desktop">
          <div className="max-w-2xl mx-auto flex items-center gap-3 sm:gap-4 min-h-[48px] sm:min-h-[56px]">
            <div className="flex items-center gap-3 min-w-0 shrink-0">
              <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} className="shrink-0 flex items-center justify-center">
                <Mascot mood={mascotMood} size="sm" />
              </motion.div>
              <div className="min-w-0 overflow-hidden">
                <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight leading-tight truncate" data-testid="text-app-title">Бадди ВПР</h1>
                <p className="text-sm sm:text-base text-muted-foreground font-normal leading-snug mt-0.5" data-testid="text-subtitle">Умный помощник для подготовки</p>
              </div>
            </div>
            <div className="flex-1 mx-2 sm:mx-4 min-w-0 max-w-[280px]">
              <TaskProgressBar current={current} total={total} />
              {timerRemainingSeconds != null && timerRemainingSeconds >= 0 && (
                <p className="text-xs text-muted-foreground mt-0.5 tabular-nums" data-testid="text-timer-desktop" aria-live="polite">
                  Осталось {formatTimer(timerRemainingSeconds)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 sm:gap-4 shrink-0" data-testid="header-stats">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    key={`stars-${correctCount}`}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-2.5 cursor-default"
                    data-testid="star-counter"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400 drop-shadow-sm shrink-0" aria-hidden />
                      <AnimatePresence mode="wait">
                        <motion.span key={goldCount} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }} className="text-sm font-bold tabular-nums text-foreground min-w-[1.25rem] text-left" data-testid="text-gold-count">{goldCount}</motion.span>
                      </AnimatePresence>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-300 text-slate-400 shrink-0" aria-hidden />
                      <AnimatePresence mode="wait">
                        <motion.span key={silverCount} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }} className="text-sm font-bold tabular-nums text-muted-foreground min-w-[1.25rem] text-left" data-testid="text-silver-count">{silverCount}</motion.span>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Верно ответов: {correctCount}
                </TooltipContent>
              </Tooltip>
              {onExit && (
                <Button variant="ghost" onClick={onExit} className="shrink-0 h-12 px-3 sm:px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-amber-100/80 dark:hover:bg-amber-900/30 hover:border hover:border-amber-200/80 dark:hover:border-amber-700/50 border border-transparent transition-colors gap-2 font-semibold text-sm sm:text-base min-h-[48px]" aria-label={exitLabel} data-testid="button-exit">
                  <DoorOpen className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] shrink-0" aria-hidden />
                  <span>{exitLabel}</span>
                </Button>
              )}
            </div>
          </div>
          {showAnimationControls && (
            <div className="max-w-2xl mx-auto flex justify-end mt-1">
              <AnimationSettings />
            </div>
          )}
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
          <div className="min-w-0 flex flex-col gap-0.5 max-w-[220px] sm:max-w-[260px]">
            <h1
              className="text-lg sm:text-2xl font-bold text-foreground tracking-tight leading-tight"
              data-testid="text-app-title"
            >
              Бадди ВПР
            </h1>
            <p
              className="text-xs sm:text-sm md:text-base text-muted-foreground font-normal leading-snug"
              data-testid="text-subtitle"
            >
              Умный помощник для подготовки
            </p>
            {rankInfo?.rank && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200/70 dark:border-emerald-700/70 pl-1 pr-2 py-0.5 text-[11px] sm:text-xs font-semibold text-emerald-800 dark:text-emerald-100">
                {rankInfo.rank}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0" data-testid="header-stats">
          {overallProgress !== undefined && (
            <div className="flex items-center justify-center" data-testid="overall-progress-widget">
              <ProgressRing progress={overallProgress} />
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                key={`stars-${correctCount}`}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2.5 cursor-default"
                data-testid="star-counter"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400 drop-shadow-sm shrink-0" aria-hidden />
                  <AnimatePresence mode="wait">
                    <motion.span key={goldCount} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }} className="text-sm font-bold tabular-nums text-foreground min-w-[1.25rem] text-left" data-testid="text-gold-count">{goldCount}</motion.span>
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-300 text-slate-400 shrink-0" aria-hidden />
                  <AnimatePresence mode="wait">
                    <motion.span key={silverCount} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }} className="text-sm font-bold tabular-nums text-muted-foreground min-w-[1.25rem] text-left" data-testid="text-silver-count">{silverCount}</motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Верно ответов: {correctCount}
            </TooltipContent>
          </Tooltip>
          <ParentDashboardLink className="shrink-0 h-12 px-3 sm:px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-violet-100/80 dark:hover:bg-violet-900/30 border border-transparent transition-colors gap-2 font-medium text-sm sm:text-base min-h-[48px]">
            <Users className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Для родителей</span>
          </ParentDashboardLink>
          {onExit && (
            <Button variant="ghost" onClick={onExit} className="shrink-0 h-12 px-3 sm:px-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-amber-100/80 dark:hover:bg-amber-900/30 hover:border hover:border-amber-200/80 dark:hover:border-amber-700/50 border border-transparent transition-colors gap-2 font-semibold text-sm sm:text-base min-h-[48px]" aria-label={exitLabel} data-testid="button-exit">
              <DoorOpen className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] shrink-0" aria-hidden />
              <span>{exitLabel}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );

  // Мобильный вариант
  const mobileCompactHeader = (
    <header
      className="w-full border-b border-border/60 bg-background/95 shrink-0 sm:hidden"
      style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      data-testid="header"
    >
      <div className="flex items-center justify-between gap-2 px-4 pt-2 pb-2 min-h-[44px]">
        <div className="flex items-center gap-2 min-w-0">
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="shrink-0 flex items-center justify-center"
          >
            <Mascot mood={mascotMood} size="sm" className="w-10 h-10" />
          </motion.div>
          <div className="min-w-0 flex flex-col gap-0.5 max-w-[200px]">
            <h1
              className="text-base font-bold text-foreground leading-tight"
              data-testid="text-app-title"
            >
              Бадди ВПР
            </h1>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Умный помощник для подготовки
            </p>
            {rankInfo?.rank && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200/70 dark:border-emerald-700/70 pl-1 pr-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-100">
                {rankInfo.rank}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ParentDashboardLink
            size="sm"
            className="gap-1 text-muted-foreground hover:text-foreground min-h-[44px] touch-manipulation"
            data-testid="button-parent-dashboard-mobile"
          >
            <Users className="w-5 h-5 shrink-0" aria-hidden />
            <span className="text-sm font-medium">Родителям</span>
          </ParentDashboardLink>

          {onExit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              className="gap-1 text-muted-foreground hover:text-foreground -mr-2 min-h-[44px] touch-manipulation"
              aria-label={exitLabel}
              data-testid="button-exit"
            >
              <DoorOpen className="w-5 h-5 shrink-0" aria-hidden />
              <span className="text-sm font-medium">{exitLabel}</span>
            </Button>
          )}

          {!onExit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-default" data-testid="star-counter">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" aria-hidden />
                  <span className="text-sm font-bold tabular-nums">{goldCount}</span>
                  <Star className="w-4 h-4 fill-slate-300 text-slate-400 shrink-0" aria-hidden />
                  <span className="text-sm font-bold tabular-nums text-muted-foreground">{silverCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Верно ответов: {correctCount}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      {showAnimationControls && (
        <div className="px-4 pb-2 pt-0 border-t border-border/40">
          <AnimationSettings />
        </div>
      )}
    </header>
  );

  return (
    <>
      {mobileCompactHeader}
      {fullHeader}
    </>
  );
}

