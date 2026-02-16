import { motion } from "framer-motion";
import { Zap, BookOpen, Star, Layers } from "lucide-react";
import { Mascot } from "./Mascot";
import { cn } from "@/lib/utils";

interface IslandMapProps {
  onSelect: (category: string) => void;
}

const islands = [
  {
    key: "accent",
    label: "Остров Ударений",
    description: "Найди секретную силу каждого слова!",
    icon: Zap,
    gradient: "from-violet-200 to-violet-100 dark:from-violet-900/40 dark:to-violet-800/30",
    iconBg: "bg-violet-300 dark:bg-violet-700",
    iconColor: "text-violet-800 dark:text-violet-200",
    borderColor: "border-violet-300 dark:border-violet-700",
    position: "self-start",
  },
  {
    key: "phonetics",
    label: "Остров Звуков",
    description: "Узнай, как звуки прячутся в буквах!",
    icon: BookOpen,
    gradient: "from-sky-200 to-sky-100 dark:from-sky-900/40 dark:to-sky-800/30",
    iconBg: "bg-sky-300 dark:bg-sky-700",
    iconColor: "text-sky-800 dark:text-sky-200",
    borderColor: "border-sky-300 dark:border-sky-700",
    position: "self-end",
  },
  {
    key: "meaning",
    label: "Остров Мудрости",
    description: "Разгадай тайны пословиц и слов!",
    icon: Star,
    gradient: "from-amber-200 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/30",
    iconBg: "bg-amber-300 dark:bg-amber-700",
    iconColor: "text-amber-800 dark:text-amber-200",
    borderColor: "border-amber-300 dark:border-amber-700",
    position: "self-start",
  },
];

export function IslandMap({ onSelect }: IslandMapProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto px-4 sm:px-6"
      data-testid="island-map"
    >
      <div className="flex items-center gap-3 mb-5">
        <Mascot mood="happy" size="sm" />
        <div>
          <h2 className="text-xl font-bold" data-testid="text-island-title">
            Карта знаний
          </h2>
          <p className="text-sm text-muted-foreground">
            Выбери остров для тренировки!
          </p>
        </div>
      </div>

      <button
        onClick={() => onSelect("all")}
        className="w-full mb-4 flex items-center gap-3 rounded-xl border-2 border-border bg-background px-4 py-3.5 transition-all hover-elevate active-elevate-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-testid="button-island-all"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
          <Layers className="w-5 h-5 text-primary" />
        </div>
        <div className="text-left">
          <p className="font-semibold text-sm">Все острова</p>
          <p className="text-xs text-muted-foreground">Смешанные задания</p>
        </div>
      </button>

      <div className="relative flex flex-col gap-4" data-testid="island-list">
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden sm:block" />

        {islands.map((island, i) => {
          const Icon = island.icon;
          return (
            <motion.div
              key={island.key}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 200, damping: 20 }}
              className={cn("sm:w-4/5", island.position)}
            >
              <button
                onClick={() => onSelect(island.key)}
                className={cn(
                  "w-full text-left rounded-2xl border-2 bg-gradient-to-br p-5",
                  "transition-all hover-elevate active-elevate-2",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  island.gradient,
                  island.borderColor
                )}
                data-testid={`button-island-${island.key}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-xl shrink-0",
                      island.iconBg
                    )}
                  >
                    <Icon className={cn("w-6 h-6", island.iconColor)} />
                  </div>
                  <div>
                    <p className="font-bold text-base mb-0.5">{island.label}</p>
                    <p className="text-sm text-muted-foreground leading-snug">
                      {island.description}
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
