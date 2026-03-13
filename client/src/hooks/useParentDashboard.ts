import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

export interface ParentChild {
  id: string;
  name: string;
  classLabel: string;
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  completedTasks: number;
  totalTasks: number;
}

export interface ChildSummary {
  childId: string;
  rank: string;
  totalStars: number;
  goldStars: number;
  silverStars: number;
  subjects: SubjectProgress[];
}

const mockChildren: ParentChild[] = [
  { id: "1", name: "Иван Иванов", classLabel: "4А" },
  { id: "2", name: "Мария Петрова", classLabel: "4Б" },
];

const mockSummaries: Record<string, ChildSummary> = {
  "1": {
    childId: "1",
    rank: "Юный исследователь",
    totalStars: 120,
    goldStars: 80,
    silverStars: 40,
    subjects: [
      {
        subjectId: "ru4",
        subjectName: "Русский язык 4 класс",
        completedTasks: 520,
        totalTasks: 752,
      },
      {
        subjectId: "math6",
        subjectName: "Математика 6 класс",
        completedTasks: 120,
        totalTasks: 300,
      },
    ],
  },
  "2": {
    childId: "2",
    rank: "Начинающий путешественник",
    totalStars: 40,
    goldStars: 20,
    silverStars: 20,
    subjects: [
      {
        subjectId: "ru4",
        subjectName: "Русский язык 4 класс",
        completedTasks: 200,
        totalTasks: 752,
      },
      {
        subjectId: "math6",
        subjectName: "Математика 6 класс",
        completedTasks: 40,
        totalTasks: 300,
      },
    ],
  },
};

export function useParentChildren() {
  return useQuery({
    queryKey: ["/api/parent/children"],
    queryFn: async () => {
      // TODO: заменить на реальный запрос к API
      return mockChildren;
    },
    staleTime: Infinity,
  });
}

export function useChildSummary(childId: string | null) {
  return useQuery({
    queryKey: ["/api/parent/child", childId, "summary"],
    enabled: !!childId,
    queryFn: async () => {
      // TODO: заменить на реальный запрос к API
      if (!childId) throw new Error("childId is required");
      return mockSummaries[childId];
    },
  });
}

export function useProgressStatus(value: number) {
  return useMemo(() => {
    if (value >= 80) return "good" as const;
    if (value >= 50) return "warning" as const;
    return "critical" as const;
  }, [value]);
}

