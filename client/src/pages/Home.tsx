import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Header, type StarType } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import type { UserProfile as MotivationUserProfile, StarCounts } from "@/types/motivation";
import { calculateNewStars } from "@/lib/starCalculation";
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
import { getStoredProfile, saveProfile } from "@/lib/storage";
import { getCategoriesForSubject, getCategoryLabelsForSubject, type SubjectId } from "@/data/subjectsConfig";
import { AnimationOnboardingDialog } from "@/components/AnimationOnboardingDialog";
import { ProfileSummary } from "@/components/ProfileSummary";
import { LevelUpModal } from "@/components/LevelUpModal";
import { useSettings, type AnimationLevel } from "@/context/SettingsContext";
import { calculateLevel } from "@/lib/levelSystem";
import { getRankInfo } from "@/lib/rankSystem";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, API_BASE } from "@/lib/queryClient";
import confetti from "canvas-confetti";

type GamePhase = "modeChoice" | "mixedModeChoice" | "diagnostic" | "powerCard" | "islandMap" | "training" | "complete";

/** Локальный алиас: профиль из спецификации мотивации (звёзды — StarCounts, starByTaskId). */
type UserProfile = MotivationUserProfile;

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

const EMPTY_STARS: StarCounts = { total: 0, gold: 0, silver: 0 };

function getSubjectIdFromUrl(): SubjectId {
  if (typeof window === "undefined") return "russian";
  const s = new URLSearchParams(window.location.search).get("subject");
  return s === "math" || s === "environment" ? s : "russian";
}

function playRewardSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.45);
  } catch {
    // Безопасное отключение звука при ошибке/запрете аудио
  }
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
  const [location] = useLocation();
  const subjectId = useMemo(() => getSubjectIdFromUrl(), [location]);
  const storedProfile = useMemo(() => getStoredProfile(subjectId), [subjectId]);
  const initialPhase: GamePhase = "modeChoice";

  // Приветственный экран с маскотом теперь показывается на отдельной странице.
  // В самой игре сразу начинаем с выбора режима без дополнительного сплэша.
  const [showSplash, setShowSplash] = useState(false);
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
  const [correctStreak, setCorrectStreak] = useState(0);
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string; emoji: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
  const [timerRemainingSeconds, setTimerRemainingSeconds] = useState<number | null>(null);
  const [roundTimedOut, setRoundTimedOut] = useState(false);

  /** Актуальные счётчики раунда для завершения по таймеру */
  const roundStateRef = useRef({ correctTasks: 0, completedTasks: 0, activeTasksLength: 0 });
  roundStateRef.current = { correctTasks, completedTasks, activeTasksLength: activeTasks.length };

  const starCounts: StarCounts = profile?.stars ?? EMPTY_STARS;
  const totalStars = starCounts.total;

  const {
    animationLevel,
    hasChosenAnimationLevel,
    setAnimationLevel,
    setHasChosenAnimationLevel,
  } = useSettings();

  const { data: serverTasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      try {
        const res = await fetch(API_BASE + "/api/tasks", { credentials: "include" });
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  // Приоритет клиентского списка: при пустом/неполном ответе API (например Vercel отдаёт HTML) используем полный список
  const allTasks = useMemo(() => {
    if (serverTasks && serverTasks.length >= tasksData.length) return serverTasks;
    return tasksData;
  }, [serverTasks]);

  const moduleCapacity = profile?.tier === "premium" ? allTasks.length : null;
  const rankInfo = useMemo(
    () => getRankInfo(totalStars, moduleCapacity),
    [totalStars, moduleCapacity]
  );

  /** Показываем баннер, когда API недоступен и используются данные из кэша */
  const isOffline = Boolean(serverTasks && serverTasks.length === 0);

  const isTrainingPhase = phase === "training" || phase === "diagnostic";
  useEffect(() => {
    if (isTrainingPhase) {
      setTimerRemainingSeconds(45 * 60);
      setRoundTimedOut(false);
    } else {
      setTimerRemainingSeconds(null);
      // roundTimedOut не сбрасываем здесь — иначе при завершении по таймеру экран покажет обычный заголовок
    }
  }, [isTrainingPhase]);

  useEffect(() => {
    if (!isTrainingPhase || timerRemainingSeconds === null) return;
    if (timerRemainingSeconds <= 0) {
      const { correctTasks: c, completedTasks: d, activeTasksLength: total } = roundStateRef.current;
      setRoundCorrectCount(c);
      setRoundWrongCount(d - c);
      setRoundTotalTasks(total);
      setRoundWrongTaskIds([]);
      setRoundTimedOut(true);
      setPhase("complete");
      setTimerRemainingSeconds(null);
      return;
    }
    const id = setInterval(() => {
      setTimerRemainingSeconds((prev) => {
        if (prev == null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isTrainingPhase, timerRemainingSeconds]);

  const goToFirstScreen = useCallback(() => setPhase("modeChoice"), []);
  const goToMap = useCallback(() => setPhase("islandMap"), []);
  const requestResetProgress = useCallback(() => setShowResetConfirm(true), []);
  const resetProgress = useCallback(() => {
    const next = profile
      ? { ...profile, stars: EMPTY_STARS, starByTaskId: {} }
      : { avatar: "buddy" as AvatarChoice, tier: "free" as const, nickname: null, stars: EMPTY_STARS };
    setProfile(next);
    saveProfile(next, subjectId);
    setShowResetConfirm(false);
    setPhase("modeChoice");
  }, [profile, subjectId]);

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

  const diagnosticCategories = useMemo(() => getCategoriesForSubject(subjectId), [subjectId]);

  const startDiagnostic = useCallback(() => {
    if (allTasks.length === 0) return;
    const categories = diagnosticCategories;
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
        const defaultProfile: UserProfile = {
          avatar: "buddy",
          tier: "free",
          nickname: null,
          stars: EMPTY_STARS,
        };
        saveProfile(defaultProfile, subjectId);
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
  }, [allTasks, diagnosticCategories, subjectId]);

  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of allTasks) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, [allTasks]);

  const { data: categoryProgressData } = useQuery<{ category: string; correctCount: number; totalTasksInCategory: number; status: string; wrongCount: number; roundNumber: number }[]>({
    queryKey: ["/api/categories/progress", sessionId],
    queryFn: async () => {
      try {
        const res = await fetch(API_BASE + `/api/categories/progress?sessionId=${sessionId}`);
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
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

  const triggerStreakReward = useCallback(
    (prefix: string) => {
      if (animationLevel === "minimal") return;

      const baseMessage = "Отлично! 5 побед подряд ⭐";

      if (animationLevel === "quiet") {
        showToast(baseMessage, "success");
        return;
      }

      setMascotMood("celebrating");
      fireConfetti();
       playRewardSound();
      showToast(prefix + baseMessage, "success");
    },
    [animationLevel, showToast]
  );

  const addStar = useCallback((taskId: number, starType: StarType) => {
    if (starType === "empty") return;
    setProfile((prev) => {
      const next = prev ?? {
        avatar: "buddy",
        tier: "free",
        nickname: null,
        stars: EMPTY_STARS,
      };
      const result = calculateNewStars({
        taskId: String(taskId),
        starType,
        currentStars: next.stars,
        starByTaskId: next.starByTaskId,
      });
      const updated: UserProfile = {
        ...next,
        stars: result.stars,
        starByTaskId: result.starByTaskId,
      };
      const wasLevel = calculateLevel(next.stars.total).level;
      const newLevel = calculateLevel(result.stars.total).level;
      if (newLevel > wasLevel) {
        const levelInfo = calculateLevel(result.stars.total);
        setLevelUpData({ level: levelInfo.level, title: levelInfo.title, emoji: levelInfo.emoji });
        fireConfetti();
        setMascotMood("celebrating");
      }
      saveProfile(updated, subjectId);
      return updated;
    });
  }, [subjectId]);

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
        const isJson = res.headers.get("content-type")?.includes("application/json");
        if (!res.ok || !isJson) {
          throw new Error("Not JSON");
        }
        let roundData: RoundData;
        try {
          roundData = await res.json();
        } catch {
          throw new Error("Parse error");
        }

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
        const filtered = [...allTasks.filter((t) => t.category === category)].sort(
          () => Math.random() - 0.5,
        );
        if (filtered.length > 0) {
          setActiveTasks(filtered);
          setCurrentTaskIndex(0);
          setCompletedTasks(0);
          setCorrectTasks(0);
          setActiveRoundId(null);
          setRoundTotalTasks(filtered.length);
          setTotalTasksInCategory(filtered.length);
          setPhase("training");
          setMascotMood("idle");
        }
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

      setCorrectStreak(prev => {
        const next = correct ? prev + 1 : 0;
        if (correct && next >= 5) {
          triggerStreakReward(prefix);
          return 0;
        }
        return next;
      });

      if (correct) {
        setCorrectTasks((prev) => prev + 1);
        setCategoryScores((prev) => ({
          ...prev,
          [currentTask.category]: (prev[currentTask.category] || 0) + 1,
        }));
        setMascotMood("celebrating");
        // Диагностика не даёт звёзд (спецификация: «разведка», не «битва»)
        if (phase !== "diagnostic") {
          addStar(currentTask.id, starType);
        }
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
    [activeTasks, currentTaskIndex, phase, sessionId, activeRoundId, activeCategory, submitAnswerMutation, showToast, addStar, profile, triggerStreakReward]
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
    <div className="min-h-[100dvh] bg-background flex flex-col overflow-x-hidden w-full max-w-[100vw]" data-testid="home-page">
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            onFinish={() => {
              setShowSplash(false);
              setPhase("modeChoice");
              if (!storedProfile) {
                const defaultProfile: UserProfile = {
                  avatar: "buddy",
                  tier: "free",
                  nickname: null,
                  stars: EMPTY_STARS,
                };
                setProfile(defaultProfile);
                saveProfile(defaultProfile, subjectId);
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

      <div className="relative z-10 flex flex-col min-h-[100dvh] md:min-h-0 md:h-auto w-full max-w-[100vw] overflow-x-hidden">
        {isOffline && (
          <div className="shrink-0 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-center text-sm py-1.5 px-2" role="status">
            Работаем офлайн: данные из кэша
          </div>
        )}
        {!showSplash && (
          <AnimationOnboardingDialog
            visible={!hasChosenAnimationLevel}
            onChoose={(level: AnimationLevel) => {
              setAnimationLevel(level);
              setHasChosenAnimationLevel(true);
            }}
          />
        )}

        <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Начать сначала?</AlertDialogTitle>
              <AlertDialogDescription>
                Все звёзды и прогресс будут сброшены. Это нельзя отменить. Аватар сохранится.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={resetProgress} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Сбросить всё
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!showSplash && levelUpData && (
          <LevelUpModal
            visible
            level={levelUpData?.level ?? 1}
            title={levelUpData?.title ?? ""}
            emoji={levelUpData?.emoji ?? "🌱"}
            onClose={() => setLevelUpData(null)}
          />
        )}

        {!showSplash && (
          <Header
            mascotMood={mascotMood}
            stars={starCounts}
            onExit={
              phase === "diagnostic" || phase === "training"
                ? goToMap
                : goToFirstScreen
            }
            overallProgress={overallProgress}
            variant={phase === "diagnostic" || phase === "training" ? "task" : "full"}
            taskProgress={
              phase === "diagnostic" || phase === "training"
                ? {
                    current: Math.min(currentTaskIndex + 1, roundTotalTasks || activeTasks.length || 1),
                    total: roundTotalTasks || activeTasks.length || 1,
                  }
                : undefined
            }
            rankInfo={rankInfo}
            exitLabel={
              phase === "diagnostic" || phase === "training"
                ? "Назад"
                : "На главную"
            }
            timerRemainingSeconds={phase === "diagnostic" || phase === "training" ? timerRemainingSeconds : null}
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
              ? "pt-0 sm:pt-2 pb-0 sm:pb-2 overflow-hidden md:overflow-y-auto md:pb-8"
              : "pt-3 sm:pt-4 pb-4 sm:pb-8 overflow-y-auto overscroll-behavior-contain safe-bottom"
          )}
        >
          <AnimatePresence mode="wait">
            {phase === "modeChoice" && (
              <ModeChoiceScreen
                key="mode-choice"
                onIslands={() => setPhase("islandMap")}
                onMixed={() => setPhase("mixedModeChoice")}
                onDiagnostic={startDiagnostic}
              />
            )}
            {phase === "diagnostic" && activeTasks.length === 0 && (
              <p key="diagnostic-loading" className="text-muted-foreground text-center py-8" data-testid="diagnostic-loading">
                Подготовка заданий…
              </p>
            )}
            {(phase === "diagnostic" || phase === "training") && currentTask && (
              <div key={`wrap-${currentTask.id}`} className="w-full flex-1 md:flex-initial flex flex-col min-h-0 overflow-hidden md:overflow-visible">
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
            {phase === "mixedModeChoice" && (
              <MixedModeChoiceScreen
                key="mixed-choice"
                onAll={() => startMixedTraining("all")}
                onOneSkill={(cat) => startMixedTraining(cat)}
                onBack={() => setPhase("modeChoice")}
                categoryKeys={diagnosticCategories}
                categoryLabels={getCategoryLabelsForSubject(subjectId)}
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
              <>
                <ProfileSummary
                  avatar={profile?.avatar ?? ("buddy" as AvatarChoice)}
                  totalStars={totalStars}
                  rankInfo={rankInfo}
                  moduleCapacity={moduleCapacity}
                  onRequestReset={requestResetProgress}
                />
                <IslandMap
                  key="islands"
                  onSelect={handleSelectIsland}
                  taskCounts={taskCounts}
                  isLoading={tasksLoading || isLoadingRound}
                  sessionId={sessionId}
                  subjectId={subjectId}
                />
              </>
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
                timedOut={roundTimedOut}
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
