import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mascot } from "./Mascot";
import { RotateCcw, Trophy, Star, Zap, BookOpen } from "lucide-react";
import { categoryLabels } from "@/lib/taskData";

interface CompletionScreenProps {
  totalCorrect: number;
  totalTasks: number;
  categoryScores: Record<string, number>;
  onRestart: () => void;
}

const categoryIconMap: Record<string, typeof Star> = {
  accent: Zap,
  phonetics: BookOpen,
  meaning: Star,
};

export function CompletionScreen({
  totalCorrect,
  totalTasks,
  categoryScores,
  onRestart,
}: CompletionScreenProps) {
  const percent = Math.round((totalCorrect / totalTasks) * 100);

  let titleText = "Супер результат!";
  let descText = "Ты настоящий чемпион! Все задания выполнены!";
  if (percent < 50) {
    titleText = "Хорошее начало!";
    descText = "Ты уже многому научился. Давай попробуем ещё раз!";
  } else if (percent < 80) {
    titleText = "Отлично!";
    descText = "Ты очень хорошо справился! Немного практики, и будет идеально!";
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="w-full max-w-lg mx-auto px-4 sm:px-6"
    >
      <Card className="overflow-visible" data-testid="completion-card">
        <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Mascot mood="celebrating" size="lg" />
          </motion.div>

          <div className="flex items-center gap-2 mt-4 mb-1">
            <Trophy className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl sm:text-3xl font-bold" data-testid="text-completion-title">
              {titleText}
            </h2>
          </div>
          <p className="text-muted-foreground mb-5" data-testid="text-completion-description">
            {descText}
          </p>

          <div className="w-full max-w-sm mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl font-bold text-primary" data-testid="text-score-percent">
                {percent}%
              </span>
              <span className="text-muted-foreground text-sm">
                ({totalCorrect}/{totalTasks})
              </span>
            </div>

            <div className="space-y-2">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const Icon = categoryIconMap[key] || Star;
                const score = categoryScores[key] || 0;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5"
                    data-testid={`score-category-${key}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: score }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                      {Array.from({ length: Math.max(0, 4 - score) }).map((_, i) => (
                        <Star
                          key={`empty-${i}`}
                          className="w-4 h-4 text-muted-foreground/30"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            onClick={onRestart}
            className="gap-2 text-base"
            size="lg"
            data-testid="button-restart"
          >
            <RotateCcw className="w-5 h-5" />
            Попробовать ещё раз
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
