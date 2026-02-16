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

export function ProgressBar({ completed, total, categoryScores }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 mb-6" data-testid="progress-section">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <h2 className="text-base font-semibold" data-testid="text-progress-title">
          Мои суперсилы
        </h2>
        <span className="text-sm text-muted-foreground" data-testid="text-progress-count">
          {completed} из {total}
        </span>
      </div>
      <Progress value={percent} className="h-3 mb-4" data-testid="progress-bar" />

      <div className="flex gap-3 flex-wrap">
        {Object.entries(categoryLabels).map(([key, label]) => {
          const Icon = categoryIconMap[key] || Star;
          const score = categoryScores[key] || 0;
          return (
            <div
              key={key}
              className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-1.5 text-sm"
              data-testid={`badge-category-${key}`}
            >
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-secondary-foreground font-medium">{label}</span>
              <span className="text-muted-foreground">{score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
