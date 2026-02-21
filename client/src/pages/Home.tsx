import { useState, useCallback, useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Header, type StarType } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { TaskCard } from "@/components/TaskCard";
import { type AvatarChoice } from "@/components/AvatarPicker";
import { PowerCard } from "@/components/PowerCard";
import { IslandMap } from "@/components/IslandMap";
import { CompletionScreen } from "@/components/CompletionScreen";
import { EmpathyToast } from "@/components/EmpathyToast";
import { SplashScreen } from "@/components/SplashScreen";
import { ModeChoiceScreen } from "@/components/ModeChoiceScreen";
import { MixedModeChoiceScreen } from "@/components/MixedModeChoiceScreen";
import { tasksData, encouragements, type Task } from "@/lib/taskData";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, API_BASE } from "@/lib/queryClient";
import confetti from "canvas-confetti";

type GamePhase = "modeChoice" | "mixedModeChoice" | "diagnostic" | "powerCard" | "islandMap" | "training" | "complete";

interface UserProfile {
  avatar: AvatarChoice;
  stars: StarType[];
  level: number;
}

interface RoundData {
  mastered: boolean;
  roundId?: number;
  roundNumber: number;
  status?: string;
  currentIndex?: number;
  totalTasks: number;
  correctCount: number;
  wrongCount: number;
  completedTaskIds?: number[];
  remainingTaskIds?: number[];
  allTaskIds?: number[];
}

function getStoredSessionId(): string {
  const stored = localStorage.getItem("buddy_session_id");
  if (stored) return stored;
  const newId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  localStorage.setItem("buddy_session_id", newId);
  return newId;
}

function getStoredProfile(): UserProfile | null {
  try {
    const stored = localStorage.getItem("buddy_profile");
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function saveProfile(profile: UserProfile) {
  localStorage.setItem("buddy_profile", JSON.stringify(profile));
}

function fireConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;
  const colors = ["#fbbf24", "#a78bfa", "#38bdf8", "#34d399", "#fb923c"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function getAvatarPrefix(avatar?: AvatarChoice): string {
  if (avatar === "robot") return "Бип-боп! ";
  return "";
}

export default function Home() {
  const storedProfile = getStoredProfile();
  const initialPhase: GamePhase = "modeChoice";

  const [showSplash, setShowSplash] = useState(true);
  const [phase, setPhase] = useState<GamePhase>(initialPhase);
  const [diagnosticStarted, setDiagnosticStarted] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [correctTasks, setCorrectTasks] = useState(0);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({});
  const [diagnosticScores, setDiagnosticScores] = useState<Record<string, { correct: number; total: number }>>({});
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [mascotMood, setMascotMood] = useState<"idle" | "happy" | "thinking" | "celebrating" | "encouraging" | "wrong" | "hint">("idle");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "encouragement" | "hint">("success");
  const [toastVisible, setToastVisible] = useState(false);
  const [sessionId] = useState(getStoredSessionId);
  const [profile, setProfile] = useState<UserProfile | null>(storedProfile);

  const [activeCategory, setActiveCategory] = useState<string>("");
  const [activeRoundId, setActiveRoundId] = useState<number | null>(null);
  const [activeRoundNumber, setActiveRoundNumber] = useState(1);
  const [roundTotalTasks, setRoundTotalTasks] = useState(0);
  const [roundCorrectCount, setRoundCorrectCount] = useState(0);
  const [roundWrongCount, setRoundWrongCount] = useState(0);
  const [roundWrongTaskIds, setRoundWrongTaskIds] = useState<number[]>([]);
  const [roundMastered, setRoundMastered] = useState(false);
  const [totalTasksInCategory, setTotalTasksInCategory] = useState(0);
  const [isLoadingRound, setIsLoadingRound] = useState(false);

  const userStars = profile?.stars || [];

  const { data: serverTasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Приоритет клиентского списка, если с API пришло меньше заданий (неполный seed на сервере)
  const allTasks = useMemo(() => {
    if (serverTasks && serverTasks.length >= tasksData.length) return serverTasks;
    return tasksData;
  }, [serverTasks]);

  // Старт диагностики: каждый остров (категория) — по 3 задания
  const startMixedTraining = useCallback(
    (category: string) => {
      const tasks =
        category === "all"
          ? [...allTasks].sort(() => Math.random() - 0.5)
          : [...allTasks.filter((t) => t.category === category)].sort(() => Math.random() - 0.5);
      if (tasks.length === 0) return;
      setActiveCategory(category);
      setActiveTasks(tasks);
      setCurrentTaskIndex(0);
      setCompletedTasks(0);
      setCorrectTasks(0);
      setCategoryScores({});
      setActiveRoundId(null);
      setRoundTotalTasks(tasks.length);
      setTotalTasksInCategory(tasks.length);
      setRoundMastered(false);
      setRoundWrongTaskIds([]);
      setPhase("training");
      setMascotMood("idle");
    },
    [allTasks]
  );

  const startDiagnostic = useCallback(() => {
    if (allTasks.length === 0) return;
    const categories = ["accent", "phonetics", "meaning", "morphemics", "morphology", "syntax"];
    const diagnosticTasks: Task[] = [];
    const shuffledCats = [...categories].sort(() => Math.random() - 0.5);
    const TASKS_PER_ISLAND = 3;
    for (const cat of shuffledCats) {
      const catTasks = [...allTasks.filter((t) => t.category === cat)];
      if (catTasks.length === 0) continue;
      // перемешиваем и берём до 3 заданий без повторов
      for (let i = 0; i < TASKS_PER_ISLAND; i++) {
        if (catTasks.length === 0) break;
        const idx = Math.floor(Math.random() * catTasks.length);
        diagnosticTasks.push(catTasks[idx]);
        catTasks.splice(idx, 1);
      }
    }
    if (diagnosticTasks.length === 0) {
      diagnosticTasks.push(...allTasks.slice(0, 3));
    }
    setPhase("diagnostic");
    setProfile((prev) => {
      if (!prev) {
        const defaultProfile: UserProfile = { avatar: "buddy", stars: [], level: 1 };
        saveProfile(defaultProfile);
        return defaultProfile;
      }
      return prev;
    });
    setActiveTasks(diagnosticTasks);
    setCurrentTaskIndex(0);
    setCompletedTasks(0);
    setCorrectTasks(0);
    setCategoryScores({});
    setDiagnosticScores({});
    setRoundTotalTasks(diagnosticTasks.length);
    setMascotMood("thinking");
    setDiagnosticStarted(true);
  }, [allTasks]);

  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of allTasks) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, [allTasks]);

  const { data: categoryProgressData } = useQuery<{ category: string; correctCount: number; totalTasksInCategory: number; status: string; wrongCount: number; roundNumber: number }[]>({
    queryKey: [`/api/categories/progress?sessionId=${sessionId}`],
    enabled: !!sessionId,
  });

  const overallProgress = useMemo(() => {
    const totalAllTasks = allTasks.length;
    if (!totalAllTasks || !categoryProgressData) return 0;
    let masteredCount = 0;
    for (const cp of categoryProgressData) {
      if (cp.status === "completed" && cp.wrongCount === 0 && cp.roundNumber > 1) {
        masteredCount += cp.totalTasksInCategory;
      } else {
        masteredCount += cp.correctCount;
      }
    }
    return Math.min(100, Math.round((masteredCount / totalAllTasks) * 100));
  }, [categoryProgressData, allTasks]);

  const taskById = useMemo(() => {
    const map = new Map<number, Task>();
    for (const t of allTasks) {
      map.set(t.id, t);
    }
    return map;
  }, [allTasks]);

  const showToast = useCallback((message: string, type: "success" | "encouragement" | "hint") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  const addStar = useCallback((starType: StarType) => {
    if (starType === "empty") return;
    setProfile((prev) => {
      const next = prev ?? { avatar: "buddy" as AvatarChoice, stars: [], level: 1 };
      const updated = { ...next, stars: [...next.stars, starType] };
      saveProfile(updated);
      return updated;
    });
  }, []);

  const handleSelectIsland = useCallback(
    async (category: string) => {
      if (category === "all") {
        const shuffled = [...allTasks].sort(() => Math.random() - 0.5);
        setActiveTasks(shuffled);
        setCurrentTaskIndex(0);
        setCompletedTasks(0);
        setCorrectTasks(0);
        setCategoryScores({});
        setActiveCategory("all");
        setActiveRoundId(null);
        setActiveRoundNumber(1);
        setRoundTotalTasks(shuffled.length);
        setTotalTasksInCategory(shuffled.length);
        setPhase("training");
        setMascotMood("idle");
        return;
      }

      setIsLoadingRound(true);
      setActiveCategory(category);

      try {
        const res = await fetch(API_BASE + `/api/round/${category}?sessionId=${sessionId}`);
        const roundData: RoundData = await res.json();

        if (roundData.mastered) {
          setRoundMastered(true);
          setActiveRoundNumber(roundData.roundNumber);
          setRoundCorrectCount(roundData.correctCount);
          setRoundWrongCount(0);
          setRoundTotalTasks(roundData.totalTasks);
          setTotalTasksInCategory(taskCounts[category] || roundData.totalTasks);
          setRoundWrongTaskIds([]);
          setPhase("complete");
          setMascotMood("celebrating");
          fireConfetti();
          setIsLoadingRound(false);
          return;
        }

        setActiveRoundId(roundData.roundId!);
        setActiveRoundNumber(roundData.roundNumber);
        setRoundTotalTasks(roundData.totalTasks);
        setRoundCorrectCount(roundData.correctCount);
        setRoundWrongCount(roundData.wrongCount);
        setTotalTasksInCategory(taskCounts[category] || roundData.totalTasks);

        const remainingIds = roundData.remainingTaskIds || [];
        let remainingTasks = remainingIds
          .map(id => taskById.get(id))
          .filter((t): t is Task => !!t);

        // Если маппинг по id не нашёл задания (разные id на сервере и в клиенте) — берём по категории
        if (remainingTasks.length === 0 && roundData.totalTasks) {
          const byCategory = allTasks.filter((t) => t.category === category);
          remainingTasks = byCategory.slice(0, roundData.totalTasks);
        }
        if (remainingTasks.length === 0) {
          setIsLoadingRound(false);
          return;
        }

        setActiveTasks(remainingTasks);
        setCurrentTaskIndex(0);
        setCompletedTasks(roundData.currentIndex || 0);
        setCorrectTasks(roundData.correctCount);
        setPhase("training");
        setMascotMood("idle");
      } catch (err) {
        console.error("Failed to load round:", err);
        const filtered = allTasks.filter((t) => t.category === category);
        setActiveTasks(filtered);
        setCurrentTaskIndex(0);
        setCompletedTasks(0);
        setCorrectTasks(0);
        setActiveRoundId(null);
        setPhase("training");
      }

      setIsLoadingRound(false);
    },
    [allTasks, sessionId, taskById, taskCounts]
  );

  const submitAnswerMutation = useMutation({
    mutationFn: async (data: { category: string; sessionId: string; taskId: number; correctFirstAttempt: boolean; attempts: number }) => {
      return apiRequest("POST", `/api/round/${data.category}/answer`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories/progress", sessionId] });
    },
  });

  const handleTaskComplete = useCallback(
    (correct: boolean, hintsUsed: number, starType: StarType) => {
      const currentTask = activeTasks[currentTaskIndex];
      const prefix = getAvatarPrefix(profile?.avatar);

      const correctFirstAttempt = correct && starType === "gold";

      if (activeRoundId && activeCategory && activeCategory !== "all") {
        submitAnswerMutation.mutate({
          category: activeCategory,
          sessionId,
          taskId: currentTask.id,
          correctFirstAttempt: correct ? correctFirstAttempt : false,
          attempts: correct ? (correctFirstAttempt ? 1 : 2) : 2,
        });
      }

      if (correct) {
        setCorrectTasks((prev) => prev + 1);
        setCategoryScores((prev) => ({
          ...prev,
          [currentTask.category]: (prev[currentTask.category] || 0) + 1,
        }));
        setMascotMood("celebrating");
        addStar(starType);
        showToast(
          prefix + encouragements[Math.floor(Math.random() * encouragements.length)],
          "success"
        );
      } else {
        setMascotMood("encouraging");
        showToast(prefix + "Не переживай! Мы разберёмся вместе!", "encouragement");
      }

      // В диагностике считаем только «верно с первой попытки», чтобы ребёнок видел слабые места
      if (phase === "diagnostic") {
        setDiagnosticScores((prev) => ({
          ...prev,
          [currentTask.category]: {
            correct: (prev[currentTask.category]?.correct || 0) + (correct && starType === "gold" ? 1 : 0),
            total: (prev[currentTask.category]?.total || 0) + 1,
          },
        }));
      }

      setCompletedTasks((prev) => prev + 1);

      const nextIndex = currentTaskIndex + 1;
      if (nextIndex >= activeTasks.length) {
        setTimeout(() => {
          if (phase === "diagnostic") {
            setPhase("powerCard");
            setMascotMood("celebrating");
          } else {
            if (activeCategory && activeCategory !== "all" && activeRoundId != null) {
              fetchRoundSummary(activeCategory).then(() => {
                setPhase("complete");
                setMascotMood("celebrating");
              });
            } else {
              // Смешанный режим или один навык без раунда API — считаем по текущим заданиям
              const total = activeTasks.length;
              const correctCount = correctTasks + (correct ? 1 : 0);
              setRoundTotalTasks(total);
              setRoundCorrectCount(correctCount);
              setRoundWrongCount(total - correctCount);
              setRoundWrongTaskIds([]);
              setPhase("complete");
              setMascotMood("celebrating");
            }
          }
        }, 400);
      } else {
        setTimeout(() => {
          setCurrentTaskIndex(nextIndex);
          setMascotMood("idle");
        }, 200);
      }
    },
    [activeTasks, currentTaskIndex, phase, sessionId, activeRoundId, activeCategory, submitAnswerMutation, showToast, addStar, profile]
  );

  const fetchRoundSummary = async (category: string) => {
    try {
      const res = await fetch(API_BASE + `/api/round/${category}/summary?sessionId=${sessionId}`);
      const summary = await res.json();
      if (summary.wrongWords) {
        setRoundWrongTaskIds(summary.wrongWords.map((w: { id: number }) => w.id));
      }
      if (summary.mastered) {
        setRoundMastered(true);
      }
      setRoundCorrectCount(summary.correctCount || 0);
      setRoundWrongCount(summary.wrongCount || 0);
    } catch {}
  };

  const handleStartNextRound = useCallback(async () => {
    if (!activeCategory || activeCategory === "all") return;
    setRoundMastered(false);
    setRoundWrongTaskIds([]);
    setRoundCorrectCount(0);
    setRoundWrongCount(0);
    await handleSelectIsland(activeCategory);
  }, [activeCategory, handleSelectIsland]);

  const handleBackToMap = useCallback(() => {
    setPhase("islandMap");
    setMascotMood("happy");
    setActiveRoundId(null);
    queryClient.invalidateQueries({ queryKey: ["/api/categories/progress", sessionId] });
  }, [sessionId]);

  const currentTask = activeTasks[currentTaskIndex];
  const totalTasks = activeTasks.length;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col overflow-x-hidden w-full max-w-[100vw]" data-testid="home-page">
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            onFinish={() => {
              setShowSplash(false);
              setPhase("modeChoice");
              if (!storedProfile) {
                const defaultProfile: UserProfile = { avatar: "buddy", stars: [], level: 1 };
                setProfile(defaultProfile);
                saveProfile(defaultProfile);
              }
            }}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-secondary/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden">
        {!showSplash && (
          <Header
            mascotMood={mascotMood}
            stars={userStars}
            onExit={() => setPhase("islandMap")}
            overallProgress={overallProgress}
            variant={phase === "diagnostic" || phase === "training" ? "task" : "full"}
            taskProgress={
              (phase === "diagnostic" || phase === "training") && activeTasks.length > 0
                ? { current: currentTaskIndex + 1, total: roundTotalTasks || activeTasks.length }
                : undefined
            }
          />
        )}

        {phase === "diagnostic" && (
          <div className="hidden sm:block shrink-0">
            <ProgressBar
              completed={completedTasks}
              total={roundTotalTasks || totalTasks}
              categoryScores={categoryScores}
            />
          </div>
        )}

        <main
          className={cn(
            "flex-1 flex flex-col items-center min-h-0 w-full max-w-[100vw] overflow-x-hidden",
            (phase === "diagnostic" || phase === "training")
              ? "pt-0 sm:pt-2 pb-0 sm:pb-2 overflow-hidden"
              : "pt-3 sm:pt-4 pb-4 sm:pb-8 overflow-y-auto overscroll-behavior-contain safe-bottom"
          )}
                  >
          <AnimatePresence mode="wait">
            {phase === "diagnostic" && activeTasks.length === 0 && (
              <p key="diagnostic-loading" className="text-muted-foreground text-center py-8" data-testid="diagnostic-loading">
                Подготовка заданий…
              </p>
            )}
            {(phase === "diagnostic" || phase === "training") && currentTask && (
              <div key={`wrap-${currentTask.id}`} className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
                <TaskCard
                  key={`task-${currentTask.id}-${currentTaskIndex}`}
                  task={currentTask}
                  onComplete={handleTaskComplete}
                  isDiscovery={phase === "diagnostic"}
                  taskIndex={currentTaskIndex}
                  totalTasks={roundTotalTasks || activeTasks.length}
                />
              </div>
            )}
            {phase === "modeChoice" && (
              <ModeChoiceScreen
                key="mode-choice"
                onIslands={() => setPhase("islandMap")}
                onMixed={() => setPhase("mixedModeChoice")}
                onDiagnostic={startDiagnostic}
              />
            )}
            {phase === "mixedModeChoice" && (
              <MixedModeChoiceScreen
                key="mixed-choice"
                onAll={() => startMixedTraining("all")}
                onOneSkill={(cat) => startMixedTraining(cat)}
                onBack={() => setPhase("modeChoice")}
              />
            )}
            {phase === "powerCard" && (
              <PowerCard
                key="power"
                categoryScores={diagnosticScores}
                onContinue={() => {
                  setPhase("islandMap");
                  setMascotMood("happy");
                }}
              />
            )}
            {phase === "islandMap" && (
              <IslandMap
                key="islands"
                onSelect={handleSelectIsland}
                taskCounts={taskCounts}
                isLoading={tasksLoading || isLoadingRound}
                sessionId={sessionId}
              />
            )}
            {phase === "complete" && (
              <CompletionScreen
                key="complete"
                totalCorrect={roundCorrectCount}
                totalWrong={roundWrongCount}
                totalTasks={roundTotalTasks}
                roundNumber={activeRoundNumber}
                wrongTaskIds={roundWrongTaskIds}
                allTasks={allTasks}
                totalTasksInCategory={totalTasksInCategory}
                mastered={roundMastered}
                category={activeCategory}
                onBackToMap={handleBackToMap}
                onNextRound={handleStartNextRound}
              />
            )}
          </AnimatePresence>
        </main>

        <EmpathyToast
          message={toastMessage}
          type={toastType}
          visible={toastVisible}
          onClose={() => setToastVisible(false)}
        />
      </div>
    </div>
  );
}
