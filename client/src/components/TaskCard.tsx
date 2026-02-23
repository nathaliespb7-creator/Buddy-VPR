import { useState, useCallback, useRef, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight, Sparkles, Star } from "lucide-react";
import { type Task, getBuddyHint } from "@/lib/taskData";
import { validateAnswer, type ValidationResult } from "@/lib/vprValidator";
import { cn } from "@/lib/utils";
import type { StarType } from "./Header";

function highlightKeyWord(text: string, correct: string): ReactNode {
  const cleaned = correct
    .replace(/^Приставка\s+/i, "")
    .replace(/\s*\+\s*корень\s+/i, "|")
    .replace(/[-]/g, "")
    .trim();

  const keywords = cleaned
    .split("|")
    .map(k => k.trim())
    .filter(k => k.length >= 2);

  if (keywords.length === 0 && correct.length >= 2) {
    keywords.push(correct.replace(/[-]/g, "").trim());
  }

  const finalKeywords = keywords.filter(k => k.length >= 2);
  if (finalKeywords.length === 0) return text;

  const escaped = finalKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");

  const parts = text.split(pattern);
  if (parts.length <= 1) return text;

  return parts.map((part, i) => {
    if (pattern.test(part)) {
      pattern.lastIndex = 0;
      return (
        <strong key={i} className="font-bold underline decoration-2 underline-offset-2">
          {part}
        </strong>
      );
    }
    pattern.lastIndex = 0;
    return part;
  });
}

interface TaskCardProps {
  task: Task;
  onComplete: (correct: boolean, hintsUsed: number, starType: StarType) => void;
  isDiscovery?: boolean;
  taskIndex?: number;
  totalTasks?: number;
}

export function TaskCard({ task, onComplete, isDiscovery, taskIndex = 0, totalTasks = 1 }: TaskCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showStarBurst, setShowStarBurst] = useState(false);
  const [earnedStarType, setEarnedStarType] = useState<StarType>("empty");
  const [usedHintButton, setUsedHintButton] = useState(false);

  const isTextInput = task.inputType === "text" && !!task.acceptableAnswers;
  const hasLongText = isTextInput || task.category === "plan" || task.category === "reading";
  const [showFullText, setShowFullText] = useState(false);

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (isTextInput) {
      if (!textAnswer.trim()) return;
      const result = validateAnswer(textAnswer, {
        modelAnswer: task.correct,
        acceptableAnswers: task.acceptableAnswers || [],
        unacceptablePatterns: task.unacceptablePatterns || [],
        keywords: task.keywords || [],
      });
      setValidationResult(result);
      const correct = result.score >= 1;
      setIsCorrect(correct);
      const starType: StarType = result.score === 2 ? "gold" : result.score === 1 ? "silver" : "empty";
      setEarnedStarType(starType);
      setShowResult(true);
      if (correct) setShowStarBurst(true);
      return;
    }

    if (!selectedOption) return;

    const correct = selectedOption === task.correct;
    setIsCorrect(correct);

    if (correct) {
      const isFirstTry = attempts === 0;
      const starType: StarType = isFirstTry && !usedHintButton ? "gold" : "silver";
      setEarnedStarType(starType);
      setShowResult(true);
      setShowStarBurst(true);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 2) {
        setShowResult(true);
        setIsCorrect(false);
        setEarnedStarType("empty");
      } else {
        setSelectedOption(null);
        if (hintLevel < 3) {
          setHintLevel((prev) => prev + 1);
        }
      }
    }
  };

  const handleNext = () => {
    onComplete(isCorrect, hintLevel, earnedStarType);
  };

  const handleShowHint = () => {
    setUsedHintButton(true);
    if (hintLevel < 3) {
      setHintLevel((prev) => prev + 1);
    }
  };

  const typeLabels: Record<string, string> = {
    accent: "Ударение",
    phonetics: "Звуки и буквы",
    meaning: "Смысл",
    morphemics: "Состав слова",
    morphology: "Части речи",
    syntax: "Предложение",
    reading: "Основная мысль",
    plan: "План текста",
  };

  const typeColors: Record<string, string> = {
    accent: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
    phonetics: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300",
    meaning: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    morphemics: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    morphology: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
    syntax: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    reading: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
    plan: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
  };

  const isGold = earnedStarType === "gold";
  const starColorClass = isGold
    ? "fill-amber-400 text-amber-400"
    : "fill-slate-300 text-slate-400";
  const starLabel = isGold ? "Золотая звезда!" : "Серебряная звезда!";

  const questionText = task.question || `Где правильное ударение в слове «${task.word}»?`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "w-full max-w-[100vw] md:max-w-2xl mx-auto flex flex-col h-full md:h-auto min-h-0 overflow-hidden md:overflow-visible",
        "px-4 sm:px-6"
      )}
      data-testid="task-card"
    >
      {/* Мобильный: один экран — вопрос сверху, варианты по центру, кнопка внизу */}
      <Card className="flex flex-col flex-1 md:flex-initial min-h-0 overflow-hidden md:overflow-visible border-0 sm:border sm:rounded-2xl shadow-none sm:shadow-sm bg-transparent sm:bg-card sm:px-5 md:px-8">
        {/* Верх: номер + вопрос + послушай (компактно) */}
        <div className="shrink-0 pt-2 sm:pt-5 md:pt-6 pb-2 md:pb-3">
          <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide" data-testid="text-question-index">
            Вопрос {taskIndex + 1} из {totalTasks}
          </span>
          {hasLongText ? (() => {
            const hasQuote = questionText.includes("«");
            const title = hasQuote ? questionText.split("«")[0].trim() : questionText.split("\n\n")[0];
            const body = hasQuote ? "«" + questionText.split("«").slice(1).join("«") : questionText.split("\n\n").slice(1).join("\n\n");
            return (
              <>
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground leading-tight mt-1" data-testid="text-task-title">
                  {title}
                </h2>
                {body && (
                  <div className="mt-2 relative">
                    <p className={cn(
                      "text-sm sm:text-base font-normal text-foreground/90 leading-relaxed whitespace-pre-line",
                      !showFullText && "line-clamp-3 sm:line-clamp-none"
                    )}>
                      {body}
                    </p>
                    {!showFullText && (
                      <button
                        type="button"
                        onClick={() => setShowFullText(true)}
                        className="sm:hidden mt-1 text-sm font-semibold text-primary touch-manipulation"
                        data-testid="button-show-full-text"
                      >
                        Показать весь текст ▼
                      </button>
                    )}
                    {showFullText && (
                      <button
                        type="button"
                        onClick={() => setShowFullText(false)}
                        className="sm:hidden mt-1 text-sm font-semibold text-muted-foreground touch-manipulation"
                      >
                        Свернуть ▲
                      </button>
                    )}
                  </div>
                )}
              </>
            );
          })() : (
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground leading-tight mt-1 line-clamp-3 sm:line-clamp-none" data-testid="text-task-title">
              {questionText}
            </h2>
          )}
          {task.type === "meaning" && task.word && !questionText.includes(task.word) && (
            <p className="text-sm text-foreground/90 mt-1 line-clamp-1" data-testid="text-proverb">
              «{task.word}»
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold", typeColors[task.type] || typeColors.accent)} data-testid="badge-task-type">
              {typeLabels[task.type] || task.type}
            </span>
            {isDiscovery && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                Разведка
              </span>
            )}
          </div>
        </div>

        {/* Варианты ответов или текстовое поле */}
        <div className="flex-1 md:flex-initial min-h-0 overflow-y-auto md:overflow-visible overflow-x-hidden overscroll-behavior-contain px-0 py-1 md:py-3" data-testid="options-list">
          {isTextInput ? (
            <div className="flex flex-col gap-3">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={showResult}
                placeholder="Напиши основную мысль текста..."
                className={cn(
                  "w-full rounded-xl border-2 px-4 py-3 text-base md:text-lg font-medium min-h-[120px] resize-none transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                  "placeholder:text-muted-foreground/50",
                  showResult && isCorrect && "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
                  showResult && !isCorrect && "border-orange-300 bg-orange-50 dark:bg-orange-900/20",
                  !showResult && "border-border bg-background"
                )}
                data-testid="textarea-answer"
              />
              {!showResult && textAnswer.length > 0 && (
                <p className="text-xs text-muted-foreground text-right">{textAnswer.length} символов</p>
              )}
            </div>
          ) : (
          <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3">
            {task.options?.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isAnswer = showResult && option === task.correct;
              const isWrong = showResult && isSelected && !isCorrect;
              return (
                <motion.button
                  key={`${task.id}-${idx}`}
                  whileTap={{ scale: showResult ? 1 : 0.98 }}
                  onClick={() => handleSelect(option)}
                  disabled={showResult}
                  className={cn(
                    "w-full text-left rounded-xl border-2 px-3 py-2.5 md:px-4 md:py-3 min-h-[48px] text-base md:text-lg font-medium transition-all touch-manipulation",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isAnswer
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200"
                      : isWrong
                      ? "border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600 text-orange-700 dark:text-orange-300"
                      : isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover-elevate"
                  )}
                  data-testid={`button-option-${idx}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0",
                        isAnswer
                          ? "bg-emerald-200 dark:bg-emerald-700 text-emerald-800 dark:text-emerald-100"
                          : isWrong
                          ? "bg-orange-200 dark:bg-orange-700 text-orange-800 dark:text-orange-100"
                          : isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 min-w-0">{option}</span>
                    {isAnswer && <Sparkles className="w-5 h-5 shrink-0 text-emerald-500 dark:text-emerald-400" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
          )}
        </div>

        {/* Подсказка / результат — компактно */}
        <div className="shrink-0 py-1">
          <AnimatePresence>
            {hintLevel > 0 && !showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-2 py-1.5 md:px-4 md:py-3 text-xs md:text-sm"
                data-testid="hint-box"
              >
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  {hintLevel === 1 ? "Бадди подсказывает" : hintLevel === 2 ? "Секретная подсказка" : "Золотое правило"}
                </p>
                <p className="text-amber-700 dark:text-amber-300 leading-snug mt-0.5" data-testid="text-hint">
                  {hintLevel === 1 ? "Подумай ещё! Ты справишься!" : hintLevel === 2 ? task.hint : (task.ruleId ? getBuddyHint(task.ruleId) : task.rule || task.hint)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {showStarBurst && (
            <div className="relative flex justify-center h-6 my-0.5" data-testid="star-burst">
              <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="flex items-center justify-center">
                <Star className={cn("w-8 h-8 drop-shadow-sm", starColorClass)} />
              </motion.div>
            </div>
          )}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-lg border px-2 py-1.5 md:px-4 md:py-3 text-xs md:text-sm",
                isCorrect ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700" : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700"
              )}
              data-testid="result-box"
            >
              <p className={cn("font-semibold", isCorrect ? "text-emerald-800 dark:text-emerald-200" : "text-orange-800 dark:text-orange-200")} data-testid="text-result-label">
                {isTextInput && validationResult
                  ? `${validationResult.score === 2 ? "Отлично! 2 балла" : validationResult.score === 1 ? "Неплохо! 1 балл" : "0 баллов"}`
                  : isCorrect ? starLabel : "Запомним вместе!"}
              </p>
              <p className={cn("leading-snug mt-0.5", isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-orange-700 dark:text-orange-300")} data-testid="text-result-explanation">
                {isTextInput && validationResult
                  ? validationResult.feedback
                  : highlightKeyWord(task.audio, task.correct)}
              </p>
              {isTextInput && showResult && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-current/10">
                  Эталонный ответ: {task.correct}
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* Кнопки внизу — прижаты к низу, safe area */}
        <div
          className="shrink-0 flex items-stretch gap-3 py-3 sm:py-4 md:pb-6"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          {!showResult ? (
            <>
              <Button
                variant="outline"
                onClick={handleShowHint}
                disabled={hintLevel >= 3}
                className="shrink-0 h-12 px-4 gap-1.5 text-sm rounded-xl border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 shadow-none touch-manipulation"
                data-testid="button-hint"
              >
                <Lightbulb className="w-4 h-4" />
                Подсказка {hintLevel > 0 && <span className="text-muted-foreground">({hintLevel}/3)</span>}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isTextInput ? !textAnswer.trim() : !selectedOption}
                className="flex-1 h-12 rounded-xl text-base touch-manipulation"
                data-testid="button-submit"
              >
                Проверить <ArrowRight className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <Button onClick={handleNext} className="w-full h-12 rounded-xl text-base touch-manipulation" data-testid="button-next">
              Дальше <ArrowRight className="w-5 h-5" aria-hidden />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
