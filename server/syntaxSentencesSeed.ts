/**
 * Конвертирует задания из island_sentences_v1.json в формат seed (task_content).
 * Используется в server/seed.ts для загрузки острова «Предложения».
 */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface SentenceTaskRaw {
  id: string;
  type: "find_subject_predicate" | "add_commas" | "combined";
  sentence: string;
  subject?: string[];
  predicate?: string[];
  corrected?: string;
  commas_needed?: boolean;
  rule: string;
  difficulty: string;
}

interface SeedTaskRow {
  type: string;
  word: string;
  question: string;
  correct: string;
  options: string[];
  audio: string;
  hint: string;
  rule: string;
  ruleId: number;
  difficulty: number;
  category: string;
}

function formatSubjectPredicate(subject: string[], predicate: string[]): string {
  return subject.join(", ") + " — " + predicate.join(", ");
}

/** Генерирует неправильные варианты для выбора (запятые). */
function wrongCommaOptions(sentence: string, corrected: string): string[] {
  const noCommas = sentence;
  const commaBeforeI = corrected.replace(/, и /g, " и ").replace(/ и /g, ", и ");
  return [noCommas, commaBeforeI].filter((s) => s !== corrected).slice(0, 2);
}

/** Генерирует неправильные варианты для подлежащее — сказуемое. */
function wrongSubjectPredicateOptions(
  subject: string[],
  predicate: string[]
): string[] {
  const correct = formatSubjectPredicate(subject, predicate);
  const swapped = formatSubjectPredicate(predicate, subject);
  const mixed =
    subject.length > 1 && predicate.length > 1
      ? predicate[0] + ", " + subject[0] + " — " + predicate[1] + ", " + subject[1]
      : swapped;
  return [swapped, mixed].filter((s) => s !== correct).slice(0, 2);
}

function convertTask(t: SentenceTaskRaw): SeedTaskRow {
  const difficulty = t.difficulty === "повышенный" ? 2 : 1;
  const base = {
    type: "syntax",
    word: t.sentence,
    rule: t.rule,
    ruleId: t.type === "add_commas" ? 21 : 20,
    difficulty,
    category: "syntax",
    audio: t.rule,
    hint: t.rule,
  };

  if (t.type === "add_commas" && t.corrected) {
    const wrongs = wrongCommaOptions(t.sentence, t.corrected);
    const options = [t.corrected, ...wrongs].slice(0, 3);
    return {
      ...base,
      question: "Расставь запятые: «" + t.sentence + "»",
      correct: t.corrected,
      options: options.length >= 2 ? options : [t.corrected, t.sentence],
    };
  }

  if (t.type === "find_subject_predicate" && t.subject && t.predicate) {
    const correct = formatSubjectPredicate(t.subject, t.predicate);
    const wrongs = wrongSubjectPredicateOptions(t.subject, t.predicate);
    const options = [correct, ...wrongs].slice(0, 3);
    return {
      ...base,
      question: "Найди подлежащее и сказуемое: «" + t.sentence + "»",
      correct,
      options: options.length >= 2 ? options : [correct, wrongs[0] || correct],
    };
  }

  if (t.type === "combined" && t.subject && t.predicate && t.corrected) {
    const correct = t.corrected;
    const wrongs = wrongCommaOptions(t.sentence, t.corrected);
    const options = [correct, ...wrongs].slice(0, 3);
    return {
      ...base,
      question: "Расставь запятые и найди основу: «" + t.sentence + "»",
      correct,
      options: options.length >= 2 ? options : [correct, t.sentence],
    };
  }

  return {
    ...base,
    question: "«" + t.sentence + "»",
    correct: t.corrected || t.sentence,
    options: [t.corrected || t.sentence, t.sentence],
  };
}

export function getSyntaxSentencesSeed(): SeedTaskRow[] {
  const raw = readFileSync(
    path.join(__dirname, "data", "island_sentences_v1.json"),
    "utf-8"
  );
  const module = JSON.parse(raw) as { tasks: SentenceTaskRaw[] };
  return module.tasks.map(convertTask);
}
