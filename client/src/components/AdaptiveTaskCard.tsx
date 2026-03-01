/**
 * Мобильно-дружелюбная карточка: passage + instruction + question.
 * Внутренняя логика: textAnswerValidator (score 0 | 1).
 * Детский UI: звёзды и мягкая обратная связь (getFeedback).
 */

import React, { useCallback, useState } from "react";
import { Task } from "@/lib/taskData";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { textAnswerValidator } from "@/lib/validators/textAnswerValidator";
import type { ValidationResult } from "@/lib/validators/textAnswerValidator";
import type { StarType } from "@/components/Header";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import "@/styles/AdaptiveTaskCard.css";

/** Детский UI: мягкая обратная связь по результату валидации */
function getFeedback(result: ValidationResult, isTextTask: boolean): string {
  if (!isTextTask) {
    return result.score ? "🌟 Отлично!" : "❌ Попробуй ещё раз";
  }
  if (result.score === 1) {
    return "🌟 Верно! Ты правильно понял(а) смысл.";
  }
  if ((result.similarityScore ?? 0) >= 0.5 && result.suggestedKeyword) {
    return `💡 Почти! Попробуй добавить слово: «${result.suggestedKeyword}»`;
  }
  return "🔄 Давай ещё раз прочитаем текст вместе.";
}

interface AdaptiveTaskCardProps {
  task: Task;
  onComplete: (correct: boolean, hintsUsed: number, starType: StarType) => void;
  isDiscovery?: boolean;
  taskIndex?: number;
  totalTasks?: number;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export const AdaptiveTaskCard: React.FC<AdaptiveTaskCardProps> = ({
  task,
  onComplete,
  taskIndex = 0,
  totalTasks = 1,
}) => {
  const isMobile = useMediaQuery("(max-width: 480px)");
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [earnedStarType, setEarnedStarType] = useState<StarType>("empty");

  const isTextTask = task.inputType === "text" && (!!task.acceptableAnswers || !!task.passage);
  const maxInstructionLength = isMobile ? 140 : 280;
  const maxPassageLength = isMobile ? 400 : 800;

  const handleSubmit = useCallback(() => {
    if (isTextTask) {
      if (!answer.trim()) return;
      const config = {
        acceptableAnswers: [task.correct, ...(task.acceptableAnswers ?? [])].filter(
          (a, i, arr) => arr.indexOf(a) === i
        ),
        unacceptablePatterns: task.unacceptablePatterns ?? [],
        keywords: task.keywords ?? [],
        minKeywordMatch: task.category === "context" ? 2 : Math.max(1, Math.ceil((task.keywords?.length ?? 0) * 0.4)),
      };
      const result = textAnswerValidator.validate(answer, config);
      setValidationResult(result);
      const correct = result.score === 1;
      setIsCorrect(correct);
      setEarnedStarType(correct ? "silver" : "empty");
      setShowResult(true);
      return;
    }
    if (selectedOption === null) return;
    const correct = selectedOption === task.correct;
    setIsCorrect(correct);
    setValidationResult({ score: correct ? 1 : 0, feedback: "" });
    setEarnedStarType(correct ? "silver" : "empty");
    setShowResult(true);
  }, [isTextTask, answer, selectedOption, task]);

  const handleNext = useCallback(() => {
    onComplete(isCorrect, 0, earnedStarType);
  }, [onComplete, isCorrect, earnedStarType]);

  const feedbackMessage =
    validationResult && showResult
      ? getFeedback(validationResult, isTextTask)
      : null;

  const isGold = earnedStarType === "gold";
  const starColorClass = isGold
    ? "fill-amber-400 text-amber-400"
    : earnedStarType === "silver"
      ? "fill-slate-400 text-slate-400"
      : "fill-slate-200 text-slate-300";

  return (
    <div className="adaptive-task-card">
      <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Вопрос {taskIndex + 1} из {totalTasks}
      </span>

      {task.passage && (
        <div className="passage-block">
          <div className="passage-label">📖 Текст:</div>
          <div
            className="passage-content"
            style={{
              maxHeight: isMobile ? "200px" : "400px",
              overflowY: "auto",
            }}
          >
            {truncateText(task.passage, maxPassageLength)}
          </div>
        </div>
      )}

      {task.instruction && (
        <div className="instruction-block">
          <div className="instruction-text">
            {truncateText(task.instruction, maxInstructionLength)}
          </div>
        </div>
      )}

      {task.question && (
        <div className="question-block">
          <div className="question-icon">❓</div>
          <div className="question-text">{task.question}</div>
        </div>
      )}

      <div className="answer-block">
        {isTextTask ? (
          <textarea
            placeholder="Твой ответ..."
            className="answer-textarea"
            rows={isMobile ? 3 : 5}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={showResult}
          />
        ) : (
          <div className="options-grid">
            {task.options?.map((opt, i) => (
              <button
                key={i}
                type="button"
                className={cn(
                  "option-btn",
                  showResult && opt === task.correct && "bg-emerald-100 border-emerald-400 text-emerald-800",
                  showResult && selectedOption === opt && !isCorrect && "bg-orange-100 border-orange-400 text-orange-800"
                )}
                onClick={() => !showResult && setSelectedOption(opt)}
                disabled={showResult}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {showResult && (
        <>
          <div className="flex justify-center my-3">
            <Star className={cn("w-8 h-8", starColorClass)} />
          </div>
          <div
            className={cn(
              "rounded-lg border px-3 py-2 text-sm mb-3",
              isCorrect
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-200"
                : "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-200"
            )}
          >
            {feedbackMessage}
          </div>
        </>
      )}

      <div className="flex gap-3 mt-3">
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={isTextTask ? !answer.trim() : selectedOption === null}
            className="flex-1 rounded-xl"
          >
            Проверить <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleNext} className="flex-1 rounded-xl">
            Дальше <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdaptiveTaskCard;
