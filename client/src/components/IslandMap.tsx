import { motion } from "framer-motion";
import { Zap, BookOpen, Star, Layers, Puzzle, Users, FileText, MapPin, Loader2, CheckCircle2, RotateCcw, BookOpenCheck, ListOrdered, Search, MessageSquareQuote, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { getIslandsForSubject, type IslandConfig, type SubjectId } from "@/data/subjectsConfig";

const ICON_MAP: Record<string, (props: { className?: string }) => React.ReactNode> = {
  Zap,
  BookOpen,
  Star,
  Layers,
  Puzzle,
  Users,
  FileText,
  MapPin,
  ListOrdered,
  BookOpenCheck,
  Search,
  MessageSquareQuote,
  CheckCircle2,
  Target,
};

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
  subjectId: SubjectId;
}

function taskCountLabel(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return `${n} задание`;
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} задания`;
  return `${n} заданий`;
}

function ProgressIndicator({ progress, island }: { progress: CategoryProgress | undefined; island: IslandConfig }) {
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

export function IslandMap({ onSelect, taskCounts, isLoading, sessionId, subjectId }: IslandMapProps) {
  const islands = getIslandsForSubject(subjectId);
  const totalTasks = taskCounts ? Object.values(taskCounts).reduce((a, b) => a + b, 0) : 0;

  const { data: categoryProgress } = useQuery<CategoryProgress[]>({
    queryKey: ["/api/categories/progress", sessionId],
    queryFn: async () => {
      try {
        const res = await fetch(API_BASE + `/api/categories/progress?sessionId=${sessionId}`);
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
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
      className="w-full max-w-[100vw] md:max-w-lg mx-auto px-3 sm:px-6 overflow-x-hidden safe-bottom pb-6"
      data-testid="island-map"
    >
      <div className="flex items-center justify-center gap-2 mb-5">
        <MapPin className="w-6 h-6 text-primary shrink-0" />
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center" data-testid="text-island-title">
          Выбирай остров!
        </h2>
      </div>

      <button
        onClick={() => onSelect("all")}
        className="w-full mb-5 flex items-center gap-3 rounded-xl border-2 border-border bg-background px-4 py-3.5 min-h-[48px] transition-all hover-elevate active-elevate-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
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
          const Icon = ICON_MAP[island.icon] ?? Zap;
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
                  "w-full text-left rounded-2xl border-2 bg-gradient-to-br p-3 sm:p-4 min-h-[48px]",
                  "transition-all hover-elevate active-elevate-2 touch-manipulation",
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
                      <p className="font-bold text-sm md:text-base mb-0.5">{island.label}</p>
                      {taskCounts && taskCounts[island.key] > 0 && (
                        <span className="text-[11px] font-medium text-muted-foreground shrink-0" data-testid={`text-count-${island.key}`}>
                          {taskCountLabel(taskCounts[island.key])}
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground leading-snug">
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
