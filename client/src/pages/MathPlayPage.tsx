/**
 * Страница прохождения заданий по выбранному острову математики ВПР 4 класс.
 * Маршрут: /play/math/:islandId
 */

import { useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { mathVprGrade4Config, mathTaskExamples } from "@/data/mathVprGrade4";
import type { MathTaskExample } from "@/data/mathVprGrade4/types";
import { subjectsConfig } from "@/config/subjectsConfig";
import { mathValidator, type MathTask, type MathValidationResult } from "@/lib/validators/mathValidator";
import { MathTaskCard } from "@/components/MathTaskCard";
import { Button } from "@/components/ui/button";

/** Приводит пример задания к формату валидатора (camelCase). */
function exampleToValidatorTask(ex: MathTaskExample): MathTask {
  const base = {
    id: ex.id,
    vprTaskNumber: ex.vpr_task_number,
    type: ex.type,
    maxScore: ex.max_score,
    partialCredit: "partial_credit" in ex ? ex.partial_credit : undefined,
  };
  if (ex.type === "mixed") {
    return {
      ...base,
      correctAnswer: ex.correct_answer_part1,
      correctAnswerPart1: ex.correct_answer_part1,
      correctAnswerPart2: ex.correct_answer_part2,
    };
  }
  if (ex.type === "text_solution") {
    return {
      ...base,
      correctAnswer: ex.correct_answer,
      correctSolution: ex.correct_solution,
    };
  }
  return {
    ...base,
    correctAnswer: "correct_answer" in ex ? ex.correct_answer : "",
  };
}

export default function MathPlayPage() {
  const [location, setLocation] = useLocation();
  const islandId = useMemo(() => {
    const match = location.match(/^\/play\/math\/([^/]+)$/);
    return match ? match[1] : null;
  }, [location]);

  // Остров для логики заданий — из единого конфига предметов (subject === 'math' → tasksSource: mathTaskExamples, фильтр по vpr_task_number).
  const island = useMemo(
    () => (islandId ? subjectsConfig.math.islands.find((i) => i.id === islandId) : null),
    [islandId]
  );
  // Отображение (иконка, описание) — из конфига модуля ВПР.
  const islandDisplay = useMemo(
    () => (islandId ? mathVprGrade4Config.islands.find((i) => i.id === islandId) : null),
    [islandId]
  );

  const tasks = useMemo(() => {
    if (!island) return [];
    return mathTaskExamples.filter((t) => island.tasks.includes(t.vpr_task_number));
  }, [island]);

  const [taskIndex, setTaskIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lastResult, setLastResult] = useState<MathValidationResult | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentTask = tasks[taskIndex] ?? null;
  const completed = taskIndex >= tasks.length && tasks.length > 0;

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!currentTask) return;
      const taskForValidator = exampleToValidatorTask(currentTask);
      const result = mathValidator.validateAnswer(answer, taskForValidator);
      setLastResult(result);
      setScore((prev) => prev + result.score);
      setShowFeedback(true);
    },
    [currentTask]
  );

  const goNext = useCallback(() => {
    setShowFeedback(false);
    setLastResult(null);
    setTaskIndex((prev) => prev + 1);
  }, []);

  const goToMap = useCallback(() => {
    setLocation("/play/math");
  }, [setLocation]);

  const goHome = useCallback(() => {
    setLocation("/class-selector");
  }, [setLocation]);

  if (!islandId || !island) {
    return (
      <main className="min-h-screen bg-background p-4">
        <p className="text-muted-foreground">Остров не найден.</p>
        <Button onClick={goToMap} variant="outline" className="mt-4">
          На карту островов
        </Button>
      </main>
    );
  }

  if (tasks.length === 0) {
    return (
      <main className="min-h-screen bg-background p-4">
        <p className="text-muted-foreground">Задания для этого острова пока не добавлены.</p>
        <Button onClick={goToMap} variant="outline" className="mt-4">
          На карту островов
        </Button>
      </main>
    );
  }

  if (completed) {
    const maxPossible = tasks.reduce((sum, t) => sum + t.max_score, 0);
    return (
      <main className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Остров пройден!</h2>
        <p className="text-muted-foreground mb-4">
          Твой результат: {score} из {maxPossible} баллов
        </p>
        <div className="flex gap-3">
          <Button onClick={goToMap}>На карту островов</Button>
          <Button variant="outline" onClick={goHome}>
            Домой
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 pb-8">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={goToMap}>
            ← На карту
          </Button>
          <span className="text-sm text-muted-foreground">
            {islandDisplay?.icon ?? "🔢"} {island.name} · {score} баллов
          </span>
        </div>

        {showFeedback && lastResult ? (
          <div
            className={`rounded-xl border p-4 mb-4 ${
              lastResult.isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950/30" : "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
            }`}
          >
            <p className="font-medium">{lastResult.feedback}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Баллов за задание: {lastResult.score}
            </p>
            <Button onClick={goNext} className="mt-3">
              Дальше
            </Button>
          </div>
        ) : (
          currentTask && (
            <MathTaskCard
              task={currentTask}
              onAnswer={handleAnswer}
              taskIndex={taskIndex}
              totalTasks={tasks.length}
            />
          )
        )}
      </div>
    </main>
  );
}
