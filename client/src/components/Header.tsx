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
  const size = 52;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const color =
    progress >= 100
      ? "text-amber-400"
      : progress >= 60
        ? "text-emerald-500"
        : progress >= 30
          ? "text-sky-500"
          : "text-sky-400";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={color}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {progress >= 100 ? (
          <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
        ) : (
          <span className="text-xs font-bold tabular-nums leading-none" data-testid="text-overall-pct">
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
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="shrink-0"
          >
            <Mascot mood={mascotMood} size="sm" />
          </motion.div>
          <div className="min-w-0">
            <h1
              className="text-xl sm:text-2xl font-bold tracking-tight leading-tight"
              data-testid="text-app-title"
            >
              Бадди ВПР
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-snug" data-testid="text-subtitle">
              Умный помощник в подготовке к&nbsp;ВПР
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {overallProgress !== undefined && (
            <div
              className="flex flex-col items-center gap-0.5"
              data-testid="overall-progress-widget"
            >
              <ProgressRing progress={overallProgress} />
              <span className="text-[9px] font-medium text-muted-foreground leading-none">
                готовность
              </span>
            </div>
          )}
          <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 px-3 py-1.5" data-testid="star-counter">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={goldCount}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="text-base font-bold tabular-nums"
                    data-testid="text-gold-count"
                  >
                    {goldCount}
                  </motion.span>
                </AnimatePresence>
                <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
              </div>
              <div className="flex items-center gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={silverCount}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="text-base font-bold tabular-nums"
                    data-testid="text-silver-count"
                  >
                    {silverCount}
                  </motion.span>
                </AnimatePresence>
                <Star className="w-4.5 h-4.5 fill-slate-300 text-slate-400" />
              </div>
            </div>
          </div>

          {onExit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onExit}
              className="text-muted-foreground"
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
