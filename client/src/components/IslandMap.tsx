import { motion } from "framer-motion";
import { Zap, BookOpen, Star, Layers, Puzzle, Users, FileText, MapPin, Loader2, CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface CategoryProgress {
  category: string;
  roundNumber: number;
  status: string;
  totalTasks: number;
  correctCount: number;
  wrongCount: number;
  currentIndex: number;
  totalTasksInCategory: number;
}

interface IslandMapProps {
  onSelect: (category: string) => void;
  taskCounts?: Record<string, number>;
  isLoading?: boolean;
  sessionId: string;
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
    dotColor: "bg-violet-400",
    progressColor: "bg-violet-400",
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
    dotColor: "bg-sky-400",
    progressColor: "bg-sky-400",
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
    dotColor: "bg-emerald-400",
    progressColor: "bg-emerald-400",
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
    dotColor: "bg-rose-400",
    progressColor: "bg-rose-400",
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
    dotColor: "bg-indigo-400",
    progressColor: "bg-indigo-400",
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
    dotColor: "bg-amber-400",
    progressColor: "bg-amber-400",
  },
];

function taskCountLabel(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return `${n} задание`;
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} задания`;
  return `${n} заданий`;
}

function ProgressIndicator({ progress, island }: { progress: CategoryProgress | undefined, island: typeof islands[0] }) {
  if (!progress) return null;

  const { currentIndex, totalTasks, roundNumber, status, correctCount, wrongCount, totalTasksInCategory } = progress;
  const isCompleted = status === "completed";
  const isMastered = isCompleted && wrongCount === 0 && roundNumber > 1;
  const completedInRound = isCompleted ? totalTasks : currentIndex;
  const pct = totalTasks > 0 ? Math.round((completedInRound / totalTasks) * 100) : 0;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1" data-testid={`text-round-${island.key}`}>
          {isMastered ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Освоено!
            </>
          ) : isCompleted ? (
            <>
              <RotateCcw className="w-3 h-3" />
              Круг {roundNumber} пройден
            </>
          ) : (
            <>Круг {roundNumber}</>
          )}
        </span>
        <span className="text-[11px] text-muted-foreground" data-testid={`text-progress-${island.key}`}>
          {isCompleted ? (
            `${correctCount} верно / ${wrongCount} ошибок`
          ) : (
            `${completedInRound} из ${totalTasks}`
          )}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted/70 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", island.progressColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {roundNumber > 1 && !isMastered && (
        <p className="text-[10px] text-muted-foreground">
          Отрабатываем ошибки ({totalTasks} из {totalTasksInCategory})
        </p>
      )}
    </div>
  );
}

export function IslandMap({ onSelect, taskCounts, isLoading, sessionId }: IslandMapProps) {
  const totalTasks = taskCounts ? Object.values(taskCounts).reduce((a, b) => a + b, 0) : 0;

  const { data: categoryProgress } = useQuery<CategoryProgress[]>({
    queryKey: ["/api/categories/progress", sessionId],
    queryFn: async () => {
      const res = await fetch(API_BASE + `/api/categories/progress?sessionId=${sessionId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!sessionId,
    refetchOnWindowFocus: true,
  });

  const progressByCategory = new Map<string, CategoryProgress>();
  if (categoryProgress) {
    for (const p of categoryProgress) {
      progressByCategory.set(p.category, p);
    }
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-lg mx-auto px-4 sm:px-6 flex flex-col items-center justify-center gap-3 py-16"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm">Загружаем задания...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto px-4 sm:px-6"
      data-testid="island-map"
    >
      <div className="flex items-center justify-center gap-2 mb-5">
        <MapPin className="w-6 h-6 text-primary shrink-0" />
        <h2 className="text-2xl font-bold text-center" data-testid="text-island-title">
          Выбирай остров!
        </h2>
      </div>

      <button
        onClick={() => onSelect("all")}
        className="w-full mb-5 flex items-center gap-3 rounded-xl border-2 border-border bg-background px-4 py-3.5 transition-all hover-elevate active-elevate-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-testid="button-island-all"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
          <Layers className="w-5 h-5 text-primary" />
        </div>
        <div className="text-left flex-1">
          <p className="font-semibold text-sm">Все острова</p>
          <p className="text-xs text-muted-foreground">Смешанные задания</p>
        </div>
        {totalTasks > 0 && (
          <span className="text-xs font-medium text-muted-foreground shrink-0" data-testid="text-total-tasks">
            {taskCountLabel(totalTasks)}
          </span>
        )}
      </button>

      <div className="relative flex flex-col gap-3 pb-4" data-testid="island-list">
        <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-border/50 -translate-x-1/2" />

        {islands.map((island, i) => {
          const Icon = island.icon;
          const isLeft = i % 2 === 0;
          const progress = progressByCategory.get(island.key);

          return (
            <motion.div
              key={island.key}
              initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
              className={cn(
                "relative w-[85%]",
                isLeft ? "self-start" : "self-end"
              )}
            >
              <div className={cn(
                "absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full z-10",
                island.dotColor,
                isLeft ? "-right-[calc(7.5%+5px)]" : "-left-[calc(7.5%+5px)]"
              )} />

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
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <p className="font-bold text-sm mb-0.5">{island.label}</p>
                      {taskCounts && taskCounts[island.key] > 0 && (
                        <span className="text-[11px] font-medium text-muted-foreground shrink-0" data-testid={`text-count-${island.key}`}>
                          {taskCountLabel(taskCounts[island.key])}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {island.description}
                    </p>
                    <ProgressIndicator progress={progress} island={island} />
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
