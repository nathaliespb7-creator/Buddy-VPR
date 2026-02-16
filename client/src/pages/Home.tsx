import { useState, useCallback, useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Header, type StarType } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { TaskCard } from "@/components/TaskCard";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { CompletionScreen } from "@/components/CompletionScreen";
import { CategoryPicker } from "@/components/CategoryPicker";
import { EmpathyToast } from "@/components/EmpathyToast";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { tasksData, discoveryTasks, encouragements, type Task } from "@/lib/taskData";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

type GamePhase = "welcome" | "discovery" | "categoryPick" | "training" | "complete";

function getStoredSessionId(): string {
  const stored = localStorage.getItem("buddy_session_id");
  if (stored) return stored;
  const newId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  localStorage.setItem("buddy_session_id", newId);
  return newId;
}

function getStoredStars(): StarType[] {
  try {
    const stored = localStorage.getItem("buddy_user_stars");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveStars(stars: StarType[]) {
  localStorage.setItem("buddy_user_stars", JSON.stringify(stars));
}

export default function Home() {
  const [phase, setPhase] = useState<GamePhase>("welcome");
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [correctTasks, setCorrectTasks] = useState(0);
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [mascotMood, setMascotMood] = useState<"idle" | "happy" | "thinking" | "celebrating" | "encouraging">("idle");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "encouragement" | "hint">("success");
  const [toastVisible, setToastVisible] = useState(false);
  const [sessionId] = useState(getStoredSessionId);
  const [userStars, setUserStars] = useState<StarType[]>(getStoredStars);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const { data: serverTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const allTasks = useMemo(() => {
    if (serverTasks && serverTasks.length > 0) {
      return serverTasks;
    }
    return tasksData;
  }, [serverTasks]);

  const { data: sessionProgress } = useQuery<Array<{ taskId: number; correct: boolean; completed: boolean }>>({
    queryKey: ["/api/progress", sessionId],
  });

  useEffect(() => {
    if (sessionProgress && sessionProgress.length > 0 && allTasks.length > 0 && phase === "welcome") {
      const scores: Record<string, number> = {};
      let correct = 0;
      sessionProgress.forEach((p) => {
        if (p.correct) {
          correct++;
          const task = allTasks.find((t) => t.id === p.taskId);
          if (task) {
            scores[task.category] = (scores[task.category] || 0) + 1;
          }
        }
      });
      if (sessionProgress.length > 0) {
        setCategoryScores(scores);
        setCorrectTasks(correct);
        setCompletedTasks(sessionProgress.length);
      }
    }
  }, [sessionProgress, allTasks, phase]);

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
    setUserStars((prev) => {
      const updated = [...prev, starType];
      saveStars(updated);
      if (updated.length % 5 === 0) {
        setTimeout(() => setShowLevelUp(true), 600);
      }
      return updated;
    });
  }, []);

  const handleStartDiscovery = useCallback(() => {
    const discoveryFromServer = allTasks.length >= 3
      ? [allTasks[0], allTasks.find(t => t.type === "phonetics") || allTasks[1], allTasks.find(t => t.type === "meaning") || allTasks[2]]
      : discoveryTasks;
    setActiveTasks(discoveryFromServer as Task[]);
    setCurrentTaskIndex(0);
    setPhase("discovery");
    setMascotMood("thinking");
  }, [allTasks]);

  const handleSelectCategory = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      const filtered =
        category === "all" ? allTasks : allTasks.filter((t) => t.category === category);
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      setActiveTasks(shuffled);
      setCurrentTaskIndex(0);
      setCompletedTasks(0);
      setCorrectTasks(0);
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

      if (correct) {
        setCorrectTasks((prev) => prev + 1);
        setCategoryScores((prev) => ({
          ...prev,
          [currentTask.category]: (prev[currentTask.category] || 0) + 1,
        }));
        setMascotMood("celebrating");
        addStar(starType);
        showToast(
          encouragements[Math.floor(Math.random() * encouragements.length)],
          "success"
        );
      } else {
        setMascotMood("encouraging");
        showToast("Ничего страшного! Ты обязательно запомнишь!", "encouragement");
      }

      setCompletedTasks((prev) => prev + 1);

      const nextIndex = currentTaskIndex + 1;
      if (nextIndex >= activeTasks.length) {
        setTimeout(() => {
          if (phase === "discovery") {
            setPhase("categoryPick");
            setMascotMood("happy");
          } else {
            setPhase("complete");
            setMascotMood("celebrating");
          }
        }, 1200);
      } else {
        setTimeout(() => {
          setCurrentTaskIndex(nextIndex);
          setMascotMood("idle");
        }, 800);
      }
    },
    [activeTasks, currentTaskIndex, phase, sessionId, saveProgressMutation, showToast, addStar]
  );

  const handleLevelUpNext = useCallback(() => {
    setShowLevelUp(false);
    setPhase("categoryPick");
    setMascotMood("happy");
  }, []);

  const handleRestart = useCallback(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("buddy_session_id", newSessionId);
    localStorage.removeItem("buddy_user_stars");
    window.location.reload();
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-secondary/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header mascotMood={mascotMood} stars={currentBatchStars} />

        {(phase === "training" || phase === "discovery") && (
          <ProgressBar
            completed={completedTasks}
            total={totalTasks}
            categoryScores={categoryScores}
          />
        )}

        <main className="flex-1 flex items-start justify-center pt-4 pb-8">
          <AnimatePresence mode="wait">
            {phase === "welcome" && (
              <WelcomeScreen key="welcome" onStart={handleStartDiscovery} />
            )}
            {(phase === "discovery" || phase === "training") && currentTask && (
              <TaskCard
                key={`task-${currentTask.id}-${currentTaskIndex}`}
                task={currentTask}
                onComplete={handleTaskComplete}
                isDiscovery={phase === "discovery"}
              />
            )}
            {phase === "categoryPick" && (
              <CategoryPicker key="category" onSelect={handleSelectCategory} />
            )}
            {phase === "complete" && (
              <CompletionScreen
                key="complete"
                totalCorrect={correctTasks}
                totalTasks={totalTasks}
                categoryScores={categoryScores}
                onRestart={handleRestart}
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
