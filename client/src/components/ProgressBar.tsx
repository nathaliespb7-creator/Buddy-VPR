import { Progress } from "@/components/ui/progress";
import { Star, Zap, BookOpen } from "lucide-react";
import { categoryLabels } from "@/lib/taskData";

interface ProgressBarProps {
  completed: number;
  total: number;
  categoryScores: Record<string, number>;
}

const categoryIconMap: Record<string, typeof Star> = {
  accent: Zap,
  phonetics: BookOpen,
  meaning: Star,
};

/** Короткие подписи для чипов в шапке (чтобы не обрезалось «Смысл и пословицы») */
const categoryShortLabels: Record<string, string> = {
  accent: "Ударения",
  phonetics: "Звуки и буквы",
  meaning: "Смысл",
  morphemics: "Состав слова",
  morphology: "Части речи",
  syntax: "Предложение",
};

export function ProgressBar({ completed, total, categoryScores }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 mb-1 shrink-0" data-testid="progress-section">
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <h2 className="text-xs sm:text-sm font-semibold" data-testid="text-progress-title">
          Наш прогресс
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums" data-testid="text-progress-count">
          {completed} из {total}
        </span>
      </div>
      <Progress value={percent} className="h-1 mb-1" data-testid="progress-bar" />

      <div className="flex gap-1 flex-nowrap overflow-x-auto overflow-y-hidden pb-0.5 -mx-0.5">
        {Object.entries(categoryLabels).map(([key, label]) => {
          const Icon = categoryIconMap[key] || Star;
          const score = categoryScores[key] || 0;
          const shortLabel = categoryShortLabels[key] ?? label;
          return (
            <div
              key={key}
              className="flex items-center gap-1 rounded-md bg-secondary/50 px-1.5 py-0.5 text-[11px] sm:text-xs shrink-0"
              data-testid={`badge-category-${key}`}
              title={label}
            >
              <Icon className="w-3 h-3 text-primary shrink-0" />
              <span className="text-secondary-foreground font-medium whitespace-nowrap leading-tight">
                {shortLabel}
              </span>
              <span className="text-muted-foreground shrink-0">{score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
