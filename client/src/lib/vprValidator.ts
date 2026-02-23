export interface TextTaskData {
  modelAnswer: string;
  acceptableAnswers: string[];
  unacceptablePatterns: string[];
  keywords: string[];
}

export interface ValidationResult {
  score: 0 | 1 | 2;
  feedback: string;
}

const RETELL_MARKERS = [
  "текст о", "рассказывается о", "автор пишет о",
  "в тексте говорится", "упоминается", "текст про",
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:«»""—–\-()]/g, "")
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]);
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  const longer = a.length >= b.length ? a : b;
  if (longer.length === 0) return 1;
  return (longer.length - levenshteinDistance(a, b)) / longer.length;
}

const FUZZY_THRESHOLD = 0.55;

export function validateAnswer(userAnswer: string, task: TextTaskData): ValidationResult {
  const normalized = normalizeText(userAnswer);

  if (normalized.length < 10) {
    return { score: 0, feedback: "Ответ слишком короткий. Напиши полным предложением." };
  }

  for (const pattern of task.unacceptablePatterns) {
    if (normalized.includes(normalizeText(pattern))) {
      return { score: 0, feedback: "Это пересказ детали, а не основная мысль. Подумай: зачем автор это написал?" };
    }
  }

  for (const marker of RETELL_MARKERS) {
    if (normalized.includes(marker)) {
      return { score: 0, feedback: "Ты описываешь тему, а не мысль. Тема — «о чём», мысль — «зачем автор это написал»." };
    }
  }

  const modelNorm = normalizeText(task.modelAnswer);
  if (similarity(normalized, modelNorm) >= FUZZY_THRESHOLD) {
    return { score: 2, feedback: "Отлично! Ты верно определил основную мысль текста." };
  }

  for (const acceptable of task.acceptableAnswers) {
    if (similarity(normalized, normalizeText(acceptable)) >= FUZZY_THRESHOLD) {
      return { score: 2, feedback: "Верно! Ты правильно сформулировал основную мысль." };
    }
  }

  const kwMatches = task.keywords.filter((kw) => normalized.includes(normalizeText(kw)));
  if (kwMatches.length >= 2) {
    return { score: 1, feedback: "Ты на верном пути! Но попробуй сформулировать мысль полнее." };
  }

  return { score: 0, feedback: "Основная мысль определена неверно. Прочитай текст ещё раз и подумай: какой вывод делает автор?" };
}
