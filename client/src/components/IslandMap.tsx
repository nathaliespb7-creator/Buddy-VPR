import { motion } from "framer-motion";
import { Zap, BookOpen, Star, Layers, Puzzle, Users, FileText } from "lucide-react";
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
    key: "morphemics",
    label: "Остров Слов-Конструктор",
    description: "Разбери слова на части: корень, приставка, суффикс!",
    icon: Puzzle,
    gradient: "from-emerald-200 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/30",
    iconBg: "bg-emerald-300 dark:bg-emerald-700",
    iconColor: "text-emerald-800 dark:text-emerald-200",
    borderColor: "border-emerald-300 dark:border-emerald-700",
    position: "self-start",
  },
  {
    key: "morphology",
    label: "Остров Частей Речи",
    description: "Узнай, кто такие глагол, существительное и их друзья!",
    icon: Users,
    gradient: "from-rose-200 to-rose-100 dark:from-rose-900/40 dark:to-rose-800/30",
    iconBg: "bg-rose-300 dark:bg-rose-700",
    iconColor: "text-rose-800 dark:text-rose-200",
    borderColor: "border-rose-300 dark:border-rose-700",
    position: "self-end",
  },
  {
    key: "syntax",
    label: "Остров Предложений",
    description: "Найди подлежащее, сказуемое и расставь запятые!",
    icon: FileText,
    gradient: "from-indigo-200 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/30",
    iconBg: "bg-indigo-300 dark:bg-indigo-700",
    iconColor: "text-indigo-800 dark:text-indigo-200",
    borderColor: "border-indigo-300 dark:border-indigo-700",
    position: "self-start",
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
    position: "self-end",
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
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <Mascot mood="happy" size="sm" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold" data-testid="text-island-title">
            Карта знаний
          </h2>
          <p className="text-sm text-muted-foreground">
            Выбирай скорее остров!
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

      <div className="relative flex flex-col gap-3" data-testid="island-list">
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden sm:block" />

        {islands.map((island, i) => {
          const Icon = island.icon;
          return (
            <motion.div
              key={island.key}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
              className={cn("sm:w-4/5", island.position)}
            >
              <button
                onClick={() => onSelect(island.key)}
                className={cn(
                  "w-full text-left rounded-2xl border-2 bg-gradient-to-br p-4",
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
                      "flex items-center justify-center w-11 h-11 rounded-xl shrink-0",
                      island.iconBg
                    )}
                  >
                    <Icon className={cn("w-5 h-5", island.iconColor)} />
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-0.5">{island.label}</p>
                    <p className="text-xs text-muted-foreground leading-snug">
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
