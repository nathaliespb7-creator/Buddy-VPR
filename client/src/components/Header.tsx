import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "./Mascot";
import { Star, LogOut, Trophy } from "lucide-react";
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
  const strokeWidth = 4.5;
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
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
            className="text-sm font-extrabold tabular-nums leading-none"
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
    <header className="w-full py-3 px-4 sm:px-6" data-testid="header">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="shrink-0"
          >
            <Mascot mood={mascotMood} size="sm" />
          </motion.div>
          <div className="min-w-0">
            <h1
              className="text-lg sm:text-xl font-bold tracking-tight leading-tight"
              data-testid="text-app-title"
            >
              Бадди ВПР
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug" data-testid="text-subtitle">
              Умный помощник к&nbsp;ВПР
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0" data-testid="header-stats">
          {overallProgress !== undefined && (
            <div
              className="flex flex-col items-center"
              data-testid="overall-progress-widget"
            >
              <ProgressRing progress={overallProgress} />
              <span className="text-[10px] font-semibold text-muted-foreground mt-0.5 tracking-wide uppercase">
                готовность
              </span>
            </div>
          )}

          <div className="flex flex-col items-center gap-0.5 ml-1" data-testid="star-counter">
            <div className="flex items-center gap-0.5">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-sm" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={goldCount}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="text-base font-bold tabular-nums min-w-[1.2rem] text-center"
                  data-testid="text-gold-count"
                >
                  {goldCount}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-0.5">
              <Star className="w-4 h-4 fill-slate-300 text-slate-400" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={silverCount}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm font-semibold tabular-nums text-muted-foreground min-w-[1.2rem] text-center"
                  data-testid="text-silver-count"
                >
                  {silverCount}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {onExit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onExit}
              className="text-muted-foreground ml-0.5"
              data-testid="button-exit"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
