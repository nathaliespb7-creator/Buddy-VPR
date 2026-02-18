import { useState, useCallback, useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Header, type StarType } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { TaskCard } from "@/components/TaskCard";
import { AvatarPicker, type AvatarChoice } from "@/components/AvatarPicker";
import { PowerCard } from "@/components/PowerCard";
import { IslandMap } from "@/components/IslandMap";
import { CompletionScreen } from "@/components/CompletionScreen";
import { EmpathyToast } from "@/components/EmpathyToast";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { SplashScreen } from "@/components/SplashScreen";
import { tasksData, encouragements, type Task } from "@/lib/taskData";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import confetti from "canvas-confetti";

type GamePhase = "avatarSelect" | "diagnostic" | "powerCard" | "islandMap" | "training" | "complete";

interface UserProfile {
  avatar: AvatarChoice;
  stars: StarType[];
  level: number;
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
  if (avatar === "cat") return "";
  if (avatar === "robot") return "Бип-боп! ";
  return "";
}

export default function Home() {
  const storedProfile = getStoredProfile();
  const initialPhase: GamePhase = storedProfile ? "islandMap" : "avatarSelect";

  const [showSplash, setShowSplash] = useState(true);
  const [phase, setPhase] = useState<GamePhase>(initialPhase);
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
  const [showLevelUp, setShowLevelUp] = useState(false);

  const userStars = profile?.stars || [];

  const { data: serverTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const allTasks = useMemo(() => {
    if (serverTasks && serverTasks.length > 0) return serverTasks;
    return tasksData;
  }, [serverTasks]);

  const saveProgressMutation = useMutation({
    mutationFn: async (data: { sessionId: string; taskId: number; correct: boolean; hintsUsed: number }) => {
      return apiRequest("POST", "/api/progress", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress", sessionId] });
    },
  });

  const showToast = useCallback((message: string, type: "success" | "encouragement" | "hint") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  const addStar = useCallback((starType: StarType) => {
    if (starType === "empty") return;
    setProfile((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, stars: [...prev.stars, starType] };
      saveProfile(updated);
      if (updated.stars.length % 5 === 0) {
        setTimeout(() => {
          fireConfetti();
          setShowLevelUp(true);
        }, 300);
      }
      return updated;
    });
  }, []);

  const handleAvatarSelect = useCallback((avatar: AvatarChoice) => {
    const newProfile: UserProfile = { avatar, stars: [], level: 1 };
    setProfile(newProfile);
    saveProfile(newProfile);

    const categories = ["accent", "phonetics", "meaning", "morphemics", "morphology", "syntax"];
    const diagnosticTasks: Task[] = [];
    const shuffledCats = [...categories].sort(() => Math.random() - 0.5).slice(0, 3);
    for (const cat of shuffledCats) {
      const catTasks = allTasks.filter((t) => t.category === cat);
      if (catTasks.length > 0) {
        diagnosticTasks.push(catTasks[Math.floor(Math.random() * catTasks.length)]);
      }
    }
    if (diagnosticTasks.length === 0) {
      const fallback = allTasks.slice(0, 3);
      diagnosticTasks.push(...fallback);
    }

    setActiveTasks(diagnosticTasks);
    setCurrentTaskIndex(0);
    setCompletedTasks(0);
    setCorrectTasks(0);
    setCategoryScores({});
    setDiagnosticScores({});
    setPhase("diagnostic");
    setMascotMood("thinking");
  }, [allTasks]);

  const handleSelectIsland = useCallback(
    (category: string) => {
      const filtered = category === "all" ? allTasks : allTasks.filter((t) => t.category === category);
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      setActiveTasks(shuffled);
      setCurrentTaskIndex(0);
      setCompletedTasks(0);
      setCorrectTasks(0);
      setCategoryScores({});
      setPhase("training");
      setMascotMood("idle");
    },
    [allTasks]
  );

  const handleTaskComplete = useCallback(
    (correct: boolean, hintsUsed: number, starType: StarType) => {
      const currentTask = activeTasks[currentTaskIndex];

      saveProgressMutation.mutate({
        sessionId,
        taskId: currentTask.id,
        correct,
        hintsUsed,
      });

      const prefix = getAvatarPrefix(profile?.avatar);

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

      if (phase === "diagnostic") {
        setDiagnosticScores((prev) => ({
          ...prev,
          [currentTask.category]: {
            correct: (prev[currentTask.category]?.correct || 0) + (correct ? 1 : 0),
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
            setPhase("complete");
            setMascotMood("celebrating");
          }
        }, 400);
      } else {
        setTimeout(() => {
          setCurrentTaskIndex(nextIndex);
          setMascotMood("idle");
        }, 200);
      }
    },
    [activeTasks, currentTaskIndex, phase, sessionId, saveProgressMutation, showToast, addStar]
  );

  const handleLevelUpNext = useCallback(() => {
    setShowLevelUp(false);
    setPhase("islandMap");
    setMascotMood("happy");
  }, []);

  const handleRestart = useCallback(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("buddy_session_id", newSessionId);
    localStorage.removeItem("buddy_profile");
    window.location.reload();
  }, []);

  const handleBackToMap = useCallback(() => {
    setPhase("islandMap");
    setMascotMood("happy");
  }, []);

  const currentTask = activeTasks[currentTaskIndex];
  const totalTasks = activeTasks.length;

  const currentBatchStars = useMemo(() => {
    const batchIndex = Math.floor(userStars.length / 5);
    const batchStart = batchIndex * 5;
    return userStars.slice(batchStart, batchStart + 5);
  }, [userStars]);

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="home-page">
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-secondary/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {phase !== "avatarSelect" && (
          <Header mascotMood={mascotMood} stars={currentBatchStars} onExit={() => setPhase("islandMap")} />
        )}

        {(phase === "training" || phase === "diagnostic") && (
          <ProgressBar
            completed={completedTasks}
            total={totalTasks}
            categoryScores={categoryScores}
          />
        )}

        <main className="flex-1 flex items-start justify-center pt-4 pb-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {phase === "avatarSelect" && (
              <AvatarPicker key="avatar" onSelect={handleAvatarSelect} />
            )}
            {(phase === "diagnostic" || phase === "training") && currentTask && (
              <TaskCard
                key={`task-${currentTask.id}-${currentTaskIndex}`}
                task={currentTask}
                onComplete={handleTaskComplete}
                isDiscovery={phase === "diagnostic"}
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
              <IslandMap key="islands" onSelect={handleSelectIsland} />
            )}
            {phase === "complete" && (
              <CompletionScreen
                key="complete"
                totalCorrect={correctTasks}
                totalTasks={totalTasks}
                categoryScores={categoryScores}
                onRestart={handleBackToMap}
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

      <LevelUpOverlay visible={showLevelUp} onNext={handleLevelUpNext} />
    </div>
  );
}
