import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, ArrowRight, Sparkles, Star, Volume2, VolumeX } from "lucide-react";
import { type Task, getBuddyHint } from "@/lib/taskData";
import { Mascot } from "./Mascot";
import { cn } from "@/lib/utils";
import type { StarType } from "./Header";

interface TaskCardProps {
  task: Task;
  onComplete: (correct: boolean, hintsUsed: number, starType: StarType) => void;
  isDiscovery?: boolean;
}

export function TaskCard({ task, onComplete, isDiscovery }: TaskCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showStarBurst, setShowStarBurst] = useState(false);
  const [earnedStarType, setEarnedStarType] = useState<StarType>("empty");
  const [usedHintButton, setUsedHintButton] = useState(false);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const findRuVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang.startsWith("ru") && v.name.toLowerCase().includes("female"))
      || voices.find(v => v.lang.startsWith("ru"))
      || null;
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ru-RU";
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    const voice = findRuVoice();
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setIsSpeechPlaying(true);
    utterance.onend = () => setIsSpeechPlaying(false);
    utterance.onerror = () => setIsSpeechPlaying(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [findRuVoice]);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeechPlaying(false);
  }, []);

  const handleListen = useCallback(() => {
    if (isSpeechPlaying) {
      stopSpeech();
    } else {
      let textToSpeak = task.audio;
      if (hintLevel === 3 && task.ruleId) {
        textToSpeak = getBuddyHint(task.ruleId);
      } else if (hintLevel === 2) {
        textToSpeak = task.hint;
      }
      speak(textToSpeak);
    }
  }, [isSpeechPlaying, task, hintLevel, speak, stopSpeech]);

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
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
  };

  const typeColors: Record<string, string> = {
    accent: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
    phonetics: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300",
    meaning: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    morphemics: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    morphology: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
    syntax: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
  };

  const isGold = earnedStarType === "gold";
  const starColorClass = isGold
    ? "fill-amber-400 text-amber-400"
    : "fill-slate-300 text-slate-400";
  const starLabel = isGold ? "Золотая звезда!" : "Серебряная звезда!";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-full max-w-2xl mx-auto px-4 sm:px-6"
    >
      <Card className="overflow-visible" data-testid="task-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold",
                  typeColors[task.type] || typeColors.accent
                )}
                data-testid="badge-task-type"
              >
                {typeLabels[task.type] || task.type}
              </span>
              {isDiscovery && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  Разведка
                </span>
              )}
            </div>
          </div>
          <CardTitle className="text-lg sm:text-xl mt-2" data-testid="text-task-title">
            {task.question || `Где правильное ударение в слове «${task.word}»?`}
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="flex flex-col items-center gap-2 mb-5">
            <Mascot
              mood={
                showResult
                  ? (isCorrect ? "celebrating" : "wrong")
                  : hintLevel > 0
                    ? "hint"
                    : "idle"
              }
              size="md"
              isSpeaking={isSpeechPlaying}
              bookOpen={hintLevel > 0}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleListen}
              className="gap-1.5 text-xs"
              data-testid="button-listen"
            >
              {isSpeechPlaying ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              {isSpeechPlaying ? "Стоп" : "Послушай"}
            </Button>
          </div>

          <div className="space-y-2.5 mb-5" data-testid="options-list">
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
                    "w-full text-left rounded-xl border-2 px-4 py-3.5 text-base font-medium transition-all",
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
                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0",
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
                    <span>{option}</span>
                    {isAnswer && (
                      <Sparkles className="w-5 h-5 ml-auto text-emerald-500 dark:text-emerald-400 shrink-0" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {hintLevel > 0 && !showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-4 py-3"
                data-testid="hint-box"
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                      {hintLevel === 1
                        ? "Бадди подсказывает"
                        : hintLevel === 2
                        ? "Секретная подсказка"
                        : "Золотое правило"}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300" data-testid="text-hint">
                      {hintLevel === 1
                        ? "Подумай ещё! Ты справишься!"
                        : hintLevel === 2
                        ? task.hint
                        : (task.ruleId ? getBuddyHint(task.ruleId) : task.rule || task.hint)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showStarBurst && (
              <div className="relative flex justify-center mb-2 h-16" data-testid="star-burst">
                {[...Array(5)].map((_, i) => {
                  const angle = (i - 2) * 30;
                  const rad = (angle * Math.PI) / 180;
                  const x = Math.sin(rad) * 60;
                  const y = -Math.cos(rad) * 50 - 10;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                      animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.3, 1, 0.5], x, y }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                      className="absolute"
                    >
                      <Star className={cn("w-7 h-7 drop-shadow-sm", starColorClass)} />
                    </motion.div>
                  );
                })}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: [0, 1.5, 1] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute"
                >
                  <Star className={cn("w-10 h-10 drop-shadow-md", starColorClass)} />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mb-4 rounded-xl border px-4 py-3",
                isCorrect
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700"
                  : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700"
              )}
              data-testid="result-box"
            >
              <div className="flex items-start gap-2">
                {isCorrect && (
                  <Star className={cn("w-5 h-5 shrink-0 mt-0.5", starColorClass)} />
                )}
                <div>
                  <p
                    className={cn(
                      "text-sm font-semibold mb-1",
                      isCorrect
                        ? "text-emerald-800 dark:text-emerald-200"
                        : "text-orange-800 dark:text-orange-200"
                    )}
                    data-testid="text-result-label"
                  >
                    {isCorrect ? starLabel : "Запомним вместе!"}
                  </p>
                  <p
                    className={cn(
                      "text-sm",
                      isCorrect
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-orange-700 dark:text-orange-300"
                    )}
                    data-testid="text-result-explanation"
                  >
                    {task.audio}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {!showResult ? (
              <>
                <Button
                  variant="ghost"
                  onClick={handleShowHint}
                  disabled={hintLevel >= 3}
                  className="gap-1.5"
                  data-testid="button-hint"
                >
                  <Lightbulb className="w-4 h-4" />
                  Подсказка
                  {hintLevel > 0 && (
                    <span className="text-xs text-muted-foreground">({hintLevel}/3)</span>
                  )}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedOption}
                  className="ml-auto gap-1.5"
                  data-testid="button-submit"
                >
                  Проверить
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNext}
                className="ml-auto gap-1.5"
                data-testid="button-next"
              >
                Дальше
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
