import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mascot } from "./Mascot";
import { RotateCcw, Trophy, CheckCircle2, XCircle, Target } from "lucide-react";

interface CompletionScreenProps {
  totalCorrect: number;
  totalTasks: number;
  onRestart: () => void;
}

export function CompletionScreen({
  totalCorrect,
  totalTasks,
  onRestart,
}: CompletionScreenProps) {
  const totalWrong = totalTasks - totalCorrect;
  const percent = totalTasks > 0 ? Math.round((totalCorrect / totalTasks) * 100) : 0;

  let titleText = "Все задания пройдены!";
  let descText = "Вот это мощь! Отличная работа!";
  if (percent < 50) {
    titleText = "Отличный старт!";
    descText = "Мы уже продвинулись! Попробуем ещё раз?";
  } else if (percent < 80) {
    titleText = "Сильный результат!";
    descText = "Ещё чуть-чуть — и будет идеально!";
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
          </div>

          <Button
            onClick={onRestart}
            className="gap-2 text-base"
            size="lg"
            data-testid="button-restart"
          >
            <RotateCcw className="w-5 h-5" />
            К карте знаний
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
