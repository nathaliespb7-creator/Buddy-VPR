/**
 * Пример использования Fuzzy-валидатора для заданий с текстовым ответом
 * (контекст, основная мысль). Используется для заданий с acceptableAnswers,
 * unacceptablePatterns, keywords.
 */

import { useState } from "react";
import { textAnswerValidator } from "@/lib/validators/textAnswerValidator";
import type { ValidationResult } from "@/lib/validators/textAnswerValidator";
import type { Task } from "@/lib/taskData";
import { cn } from "@/lib/utils";

interface ContextTaskCardProps {
  task: Task;
  onComplete?: (correct: boolean, score: 0 | 1) => void;
}

export function ContextTaskCard({ task, onComplete }: ContextTaskCardProps) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleSubmit = () => {
    if (!answer.trim()) return;

    const validation = textAnswerValidator.validate(answer, {
      acceptableAnswers: task.acceptableAnswers ?? [],
      unacceptablePatterns: task.unacceptablePatterns ?? [],
      keywords: task.keywords ?? [],
      minKeywordMatch: 2,
    });

    setResult(validation);
    onComplete?.(validation.score === 1, validation.score);
  };

  const showResult = result !== null;

  return (
    <div className="context-task-card rounded-2xl border bg-card p-4 sm:p-6">
      {task.question && (
        <p className="text-sm text-muted-foreground mb-2 whitespace-pre-line">
          {task.question}
        </p>
      )}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={showResult}
        placeholder="Объясни значение слова..."
        className={cn(
          "w-full rounded-xl border-2 px-4 py-3 text-base min-h-[120px] resize-none transition-all",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          showResult && result?.score === 1 && "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
          showResult && result?.score === 0 && "border-orange-300 bg-orange-50 dark:bg-orange-900/20"
        )}
        data-testid="context-answer-input"
      />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!answer.trim() || showResult}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          data-testid="context-submit"
        >
          Проверить
        </button>
      </div>
      {showResult && result && (
        <div
          className={cn(
            "mt-3 rounded-lg border px-3 py-2 text-sm",
            result.score === 1
              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-800 dark:text-emerald-200"
              : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 text-orange-800 dark:text-orange-200"
          )}
          data-testid="context-feedback"
        >
          {result.feedback}
        </div>
      )}
    </div>
  );
}
