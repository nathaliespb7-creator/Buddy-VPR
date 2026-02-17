import { motion } from "framer-motion";
import { Mascot } from "./Mascot";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type StarType = "gold" | "silver" | "empty";

interface HeaderProps {
  mascotMood: "idle" | "happy" | "thinking" | "celebrating" | "encouraging" | "wrong" | "hint";
  stars: StarType[];
}

export function Header({ mascotMood, stars }: HeaderProps) {
  const displayStars: StarType[] = [];
  for (let i = 0; i < 5; i++) {
    displayStars.push(stars[i] || "empty");
  }

  return (
    <header className="w-full py-4 px-4 sm:px-6" data-testid="header">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Mascot mood={mascotMood} size="sm" />
          <div>
            <h1
              className="text-xl sm:text-2xl font-bold tracking-tight"
              data-testid="text-app-title"
            >
              ВПР Бадди
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="text-subtitle">
              Твой напарник в подготовке к ВПР
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-1 rounded-md bg-muted/50 border border-border px-2.5 py-1.5"
          data-testid="star-counter"
        >
          {displayStars.map((type, i) => (
            <motion.div
              key={i}
              initial={type !== "empty" ? { scale: 0 } : false}
              animate={type !== "empty" ? { scale: [0, 1.4, 1] } : {}}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <Star
                className={cn(
                  "w-5 h-5 transition-all",
                  type === "gold"
                    ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                    : type === "silver"
                    ? "fill-slate-300 text-slate-400 dark:fill-slate-400 dark:text-slate-500"
                    : "text-muted-foreground/25"
                )}
                data-testid={`star-slot-${i}`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </header>
  );
}
