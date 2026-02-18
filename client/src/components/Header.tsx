import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "./Mascot";
import { Star, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export type StarType = "gold" | "silver" | "empty";

interface HeaderProps {
  mascotMood: "idle" | "happy" | "thinking" | "celebrating" | "encouraging" | "wrong" | "hint";
  stars: StarType[];
  onExit?: () => void;
}

export function Header({ mascotMood, stars, onExit }: HeaderProps) {
  const goldCount = stars.filter(s => s === "gold").length;
  const silverCount = stars.filter(s => s === "silver").length;
  const totalStars = goldCount + silverCount;

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
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-1.5" data-testid="star-counter">
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
