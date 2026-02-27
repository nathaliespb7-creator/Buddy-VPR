/**
 * Типы для модуля «Остров предложений» (island_sentences_v1).
 * Используются при загрузке JSON и в syntaxValidator.
 */

export type SentenceTaskType = "find_subject_predicate" | "add_commas" | "combined";

export interface SentenceTask {
  id: string;
  type: SentenceTaskType;
  sentence: string;
  subject?: string[];
  predicate?: string[];
  corrected?: string;
  commas_needed?: boolean;
  rule: string;
  difficulty: "базовый" | "повышенный";
}

export interface IslandSentencesModule {
  module_id: string;
  app_name: string;
  grade: number;
  year: number;
  source: string;
  description: string;
  skills_tested: string[];
  max_score_per_task: number;
  time_limit_seconds: number;
  tasks: SentenceTask[];
  validation_logic?: Record<string, unknown>;
  hint_system?: Record<string, unknown>;
  integration_notes?: Record<string, unknown>;
}
