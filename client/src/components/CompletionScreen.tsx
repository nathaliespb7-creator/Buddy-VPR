import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mascot } from "./Mascot";
import { ArrowRight, Trophy, CheckCircle2, XCircle, Target, MapPin, Star } from "lucide-react";
import type { Task } from "@/lib/taskData";

interface CompletionScreenProps {
  totalCorrect: number;
  totalWrong: number;
  totalTasks: number;
  roundNumber: number;
  wrongTaskIds: number[];
  allTasks: Task[];
  totalTasksInCategory: number;
  mastered: boolean;
  category: string;
  onBackToMap: () => void;
  onNextRound: () => void;
}

export function CompletionScreen({
  totalCorrect,
  totalWrong,
  totalTasks,
  roundNumber,
  wrongTaskIds,
  allTasks,
  totalTasksInCategory,
  mastered,
  category,
  onBackToMap,
  onNextRound,
}: CompletionScreenProps) {
  const percent = totalTasks > 0 ? Math.round((totalCorrect / totalTasks) * 100) : 0;

  const wrongWords = allTasks
    .filter(t => wrongTaskIds.includes(t.id))
    .map(t => t.word);

  let titleText: string;
  let descText: string;
  let mascotMood: "celebrating" | "encouraging" | "happy" = "celebrating";

  if (mastered) {
    titleText = "Категория освоена!";
    descText = "Все задания выполнены верно! Ты настоящий герой!";
    mascotMood = "celebrating";
  } else if (percent >= 80) {
    titleText = `Круг ${roundNumber} пройден!`;
    descText = "Отличный результат! Осталось совсем чуть-чуть!";
    mascotMood = "happy";
  } else if (percent >= 50) {
    titleText = `Круг ${roundNumber} пройден!`;
    descText = "Хорошо идём! Давай закрепим результат!";
    mascotMood = "happy";
  } else {
    titleText = `Круг ${roundNumber} пройден!`;
    descText = "Мы узнали, что нужно подтянуть. Вперёд!";
    mascotMood = "encouraging";
  }

  const progressWidth = `${percent}%`;
  const progressColor =
    percent >= 80
      ? "bg-emerald-400 dark:bg-emerald-500"
      : percent >= 50
      ? "bg-amber-400 dark:bg-amber-500"
      : "bg-orange-400 dark:bg-orange-500";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="w-full max-w-lg mx-auto px-3 sm:px-6 max-w-[100vw] overflow-x-hidden safe-bottom pb-6"
    >
      <Card className="overflow-visible" data-testid="completion-card">
        <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Mascot mood={mascotMood} size="lg" />
          </motion.div>

          <div className="flex items-center gap-2 mt-4 mb-1">
            {mastered ? (
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            ) : (
              <Trophy className="w-6 h-6 text-amber-500" />
            )}
            <h2 className="text-xl sm:text-3xl font-bold" data-testid="text-completion-title">
              {titleText}
            </h2>
          </div>
          <p className="text-muted-foreground mb-5" data-testid="text-completion-description">
            {descText}
          </p>

          <div className="w-full max-w-sm mb-6">
            <div className="flex items-center justify-center mb-3">
              <span className="text-4xl font-bold text-primary" data-testid="text-score-percent">
                {percent}%
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-muted mb-5 overflow-hidden" data-testid="progress-bar-result">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: progressWidth }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className={`h-full rounded-full ${progressColor}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-2">
              <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 py-3 px-2" data-testid="stat-total">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{totalTasks}</span>
                <span className="text-[11px] text-muted-foreground leading-tight">
                  {totalTasks === 1 ? "задание" : totalTasks < 5 ? "задания" : "заданий"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 py-3 px-2" data-testid="stat-correct">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{totalCorrect}</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 leading-tight">верно</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-orange-50 dark:bg-orange-900/20 py-3 px-2" data-testid="stat-wrong">
                <XCircle className="w-5 h-5 text-orange-500" />
                <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">{totalWrong}</span>
                <span className="text-[11px] text-orange-600 dark:text-orange-400 leading-tight">ошибок</span>
              </div>
            </div>

            {roundNumber > 1 && (
              <p className="text-xs text-muted-foreground mt-2 mb-2" data-testid="text-round-info">
                Отработка ошибок: {totalTasks} из {totalTasksInCategory} слов
              </p>
            )}
          </div>

          {wrongWords.length > 0 && !mastered && (
            <div className="w-full max-w-sm mb-6 text-left" data-testid="wrong-words-section">
              <p className="text-sm font-semibold mb-2 text-orange-700 dark:text-orange-300">
                Слова для повторения ({wrongWords.length}):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {wrongWords.map((word, i) => (
                  <span
                    key={i}
                    className="inline-block text-xs px-2 py-1 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700"
                    data-testid={`wrong-word-${i}`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 w-full max-w-sm">
            {wrongWords.length > 0 && !mastered && (
              <Button
                onClick={onNextRound}
                className="gap-2 text-base w-full min-h-[48px] touch-manipulation"
                size="lg"
                data-testid="button-next-round"
              >
                <ArrowRight className="w-5 h-5" />
                Круг {roundNumber + 1}: повторить ошибки ({wrongWords.length})
              </Button>
            )}

            <Button
              variant={wrongWords.length > 0 && !mastered ? "outline" : "default"}
              onClick={onBackToMap}
              className="gap-2 text-base w-full min-h-[48px] touch-manipulation"
              size="lg"
              data-testid="button-back-to-map"
            >
              <MapPin className="w-5 h-5" />
              К карте знаний
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
