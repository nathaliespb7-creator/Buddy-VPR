import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "./Mascot";
import { Star } from "lucide-react";

export type StarType = "gold" | "silver" | "empty";

interface HeaderProps {
  mascotMood: "idle" | "happy" | "thinking" | "celebrating" | "encouraging" | "wrong" | "hint";
  stars: StarType[];
}

export function Header({ mascotMood, stars }: HeaderProps) {
  const totalStars = stars.filter(s => s !== "empty").length;

  return (
    <header className="w-full py-3 px-4 sm:px-6" data-testid="header">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
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
              className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight"
              data-testid="text-app-title"
            >
              Бадди ВПР
            </h1>
            <p className="text-sm text-muted-foreground truncate" data-testid="text-subtitle">
              Твой напарник в подготовке к ВПР
            </p>
          </div>
        </div>
        <motion.div
          className="flex items-center gap-1.5 shrink-0"
          data-testid="star-counter"
          key={totalStars}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={totalStars}
              initial={{ scale: 1.6, y: -4 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="text-xl font-bold tabular-nums text-foreground"
              data-testid="text-star-count"
            >
              {totalStars}
            </motion.span>
          </AnimatePresence>
          <motion.div
            key={`star-icon-${totalStars}`}
            initial={{ rotate: -30, scale: 1.4 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Star
              className="w-6 h-6 fill-amber-400 text-amber-400 drop-shadow-sm"
              data-testid="star-slot-0"
            />
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}
