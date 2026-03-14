/**
 * Единый конфиг предметов и островов для карты и диагностики.
 * Используется в IslandMap, Home (startDiagnostic, MixedMode) и при передаче subject по URL.
 */

export type SubjectId = "russian" | "math" | "environment";

export interface IslandConfig {
  key: string;
  label: string;
  description: string;
  /** Имя иконки Lucide (Zap, BookOpen, …) для маппинга в компоненте */
  icon: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  dotColor: string;
  progressColor: string;
}

export interface SubjectIslandsConfig {
  name: string;
  islands: IslandConfig[];
}

const TAIL = " dark:to-violet-800/30";
const russianIslands: IslandConfig[] = [
  { key: "accent", label: "Остров Ударений", description: "Найди секретную силу каждого слова!", icon: "Zap", gradient: "from-violet-200 to-violet-100 dark:from-violet-900/40" + TAIL, iconBg: "bg-violet-300 dark:bg-violet-700", iconColor: "text-violet-800 dark:text-violet-200", borderColor: "border-violet-300 dark:border-violet-700", dotColor: "bg-violet-400", progressColor: "bg-violet-400" },
  { key: "phonetics", label: "Остров Звуков", description: "Узнай, как звуки прячутся в буквах!", icon: "BookOpen", gradient: "from-sky-200 to-sky-100 dark:from-sky-900/40 dark:to-sky-800/30", iconBg: "bg-sky-300 dark:bg-sky-700", iconColor: "text-sky-800 dark:text-sky-200", borderColor: "border-sky-300 dark:border-sky-700", dotColor: "bg-sky-400", progressColor: "bg-sky-400" },
  { key: "morphemics", label: "Остров Слов-Конструктор", description: "Разбери слова на части: корень, приставка, суффикс!", icon: "Puzzle", gradient: "from-emerald-200 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/30", iconBg: "bg-emerald-300 dark:bg-emerald-700", iconColor: "text-emerald-800 dark:text-emerald-200", borderColor: "border-emerald-300 dark:border-emerald-700", dotColor: "bg-emerald-400", progressColor: "bg-emerald-400" },
  { key: "morphology", label: "Остров Частей Речи", description: "Узнай, кто такие глагол, существительное и их друзья!", icon: "Users", gradient: "from-rose-200 to-rose-100 dark:from-rose-900/40 dark:to-rose-800/30", iconBg: "bg-rose-300 dark:bg-rose-700", iconColor: "text-rose-800 dark:text-rose-200", borderColor: "border-rose-300 dark:border-rose-700", dotColor: "bg-rose-400", progressColor: "bg-rose-400" },
  { key: "syntax", label: "Остров Предложений", description: "Найди подлежащее, сказуемое и расставь запятые!", icon: "FileText", gradient: "from-indigo-200 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/30", iconBg: "bg-indigo-300 dark:bg-indigo-700", iconColor: "text-indigo-800 dark:text-indigo-200", borderColor: "border-indigo-300 dark:border-indigo-700", dotColor: "bg-indigo-400", progressColor: "bg-indigo-400" },
  { key: "vocabulary", label: "Остров Слов", description: "Подбери слово с таким же значением (синоним)!", icon: "Search", gradient: "from-fuchsia-200 to-fuchsia-100 dark:from-fuchsia-900/40 dark:to-fuchsia-800/30", iconBg: "bg-fuchsia-300 dark:bg-fuchsia-700", iconColor: "text-fuchsia-800 dark:text-fuchsia-200", borderColor: "border-fuchsia-300 dark:border-fuchsia-700", dotColor: "bg-fuchsia-400", progressColor: "bg-fuchsia-400" },
  { key: "context", label: "Остров контекста", description: "Объясни, что значит слово в предложении!", icon: "MessageSquareQuote", gradient: "from-orange-200 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/30", iconBg: "bg-orange-300 dark:bg-orange-700", iconColor: "text-orange-800 dark:text-orange-200", borderColor: "border-orange-300 dark:border-orange-700", dotColor: "bg-orange-400", progressColor: "bg-orange-400" },
  { key: "plan", label: "Остров Планов", description: "Составь план текста из 3 пунктов!", icon: "ListOrdered", gradient: "from-cyan-200 to-cyan-100 dark:from-cyan-900/40 dark:to-cyan-800/30", iconBg: "bg-cyan-300 dark:bg-cyan-700", iconColor: "text-cyan-800 dark:text-cyan-200", borderColor: "border-cyan-300 dark:border-cyan-700", dotColor: "bg-cyan-400", progressColor: "bg-cyan-400" },
  { key: "reading", label: "Остров Текстов", description: "Прочитай текст и найди главную мысль!", icon: "BookOpenCheck", gradient: "from-teal-200 to-teal-100 dark:from-teal-900/40 dark:to-teal-800/30", iconBg: "bg-teal-300 dark:bg-teal-700", iconColor: "text-teal-800 dark:text-teal-200", borderColor: "border-teal-300 dark:border-teal-700", dotColor: "bg-teal-400", progressColor: "bg-teal-400" },
  { key: "meaning", label: "Остров Мудрости", description: "Разгадай тайны пословиц и слов!", icon: "Star", gradient: "from-amber-200 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/30", iconBg: "bg-amber-300 dark:bg-amber-700", iconColor: "text-amber-800 dark:text-amber-200", borderColor: "border-amber-300 dark:border-amber-700", dotColor: "bg-amber-400", progressColor: "bg-amber-400" },
];

const mathIslands: IslandConfig[] = [
  { key: "numbers", label: "Числа и величины", description: "Работа с числами, сравнение, округление.", icon: "Layers", gradient: "from-violet-200 to-violet-100 dark:from-violet-900/40 dark:to-violet-800/30", iconBg: "bg-violet-300 dark:bg-violet-700", iconColor: "text-violet-800 dark:text-violet-200", borderColor: "border-violet-300 dark:border-violet-700", dotColor: "bg-violet-400", progressColor: "bg-violet-400" },
  { key: "arithmetic", label: "Арифметика", description: "Действия с числами, порядок действий.", icon: "Zap", gradient: "from-sky-200 to-sky-100 dark:from-sky-900/40 dark:to-sky-800/30", iconBg: "bg-sky-300 dark:bg-sky-700", iconColor: "text-sky-800 dark:text-sky-200", borderColor: "border-sky-300 dark:border-sky-700", dotColor: "bg-sky-400", progressColor: "bg-sky-400" },
  { key: "geometry", label: "Геометрия", description: "Фигуры, площадь, периметр.", icon: "Puzzle", gradient: "from-emerald-200 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/30", iconBg: "bg-emerald-300 dark:bg-emerald-700", iconColor: "text-emerald-800 dark:text-emerald-200", borderColor: "border-emerald-300 dark:border-emerald-700", dotColor: "bg-emerald-400", progressColor: "bg-emerald-400" },
  { key: "text", label: "Текстовые задачи", description: "Решение задач на движение, работу и др.", icon: "FileText", gradient: "from-rose-200 to-rose-100 dark:from-rose-900/40 dark:to-rose-800/30", iconBg: "bg-rose-300 dark:bg-rose-700", iconColor: "text-rose-800 dark:text-rose-200", borderColor: "border-rose-300 dark:border-rose-700", dotColor: "bg-rose-400", progressColor: "bg-rose-400" },
  { key: "data", label: "Данные и вероятности", description: "Таблицы, диаграммы, простейшая вероятность.", icon: "Search", gradient: "from-fuchsia-200 to-fuchsia-100 dark:from-fuchsia-900/40 dark:to-fuchsia-800/30", iconBg: "bg-fuchsia-300 dark:bg-fuchsia-700", iconColor: "text-fuchsia-800 dark:text-fuchsia-200", borderColor: "border-fuchsia-300 dark:border-fuchsia-700", dotColor: "bg-fuchsia-400", progressColor: "bg-fuchsia-400" },
  { key: "fractions", label: "Дроби", description: "Обыкновенные и десятичные дроби.", icon: "BookOpen", gradient: "from-indigo-200 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/30", iconBg: "bg-indigo-300 dark:bg-indigo-700", iconColor: "text-indigo-800 dark:text-indigo-200", borderColor: "border-indigo-300 dark:border-indigo-700", dotColor: "bg-indigo-400", progressColor: "bg-indigo-400" },
  { key: "equations", label: "Уравнения", description: "Найди неизвестное.", icon: "Target", gradient: "from-orange-200 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/30", iconBg: "bg-orange-300 dark:bg-orange-700", iconColor: "text-orange-800 dark:text-orange-200", borderColor: "border-orange-300 dark:border-orange-700", dotColor: "bg-orange-400", progressColor: "bg-orange-400" },
  { key: "measure", label: "Единицы измерения", description: "Длина, масса, время, площадь.", icon: "ListOrdered", gradient: "from-cyan-200 to-cyan-100 dark:from-cyan-900/40 dark:to-cyan-800/30", iconBg: "bg-cyan-300 dark:bg-cyan-700", iconColor: "text-cyan-800 dark:text-cyan-200", borderColor: "border-cyan-300 dark:border-cyan-700", dotColor: "bg-cyan-400", progressColor: "bg-cyan-400" },
  { key: "logic", label: "Логика и рассуждения", description: "Сравнение, выбор верного утверждения.", icon: "Star", gradient: "from-teal-200 to-teal-100 dark:from-teal-900/40 dark:to-teal-800/30", iconBg: "bg-teal-300 dark:bg-teal-700", iconColor: "text-teal-800 dark:text-teal-200", borderColor: "border-teal-300 dark:border-teal-700", dotColor: "bg-teal-400", progressColor: "bg-teal-400" },
  { key: "expressions", label: "Числовые выражения", description: "Значение выражения, порядок действий.", icon: "BookOpenCheck", gradient: "from-amber-200 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/30", iconBg: "bg-amber-300 dark:bg-amber-700", iconColor: "text-amber-800 dark:text-amber-200", borderColor: "border-amber-300 dark:border-amber-700", dotColor: "bg-amber-400", progressColor: "bg-amber-400" },
  { key: "patterns", label: "Закономерности", description: "Продолжи ряд, найди правило.", icon: "Users", gradient: "from-lime-200 to-lime-100 dark:from-lime-900/40 dark:to-lime-800/30", iconBg: "bg-lime-300 dark:bg-lime-700", iconColor: "text-lime-800 dark:text-lime-200", borderColor: "border-lime-300 dark:border-lime-700", dotColor: "bg-lime-400", progressColor: "bg-lime-400" },
];

const environmentIslands: IslandConfig[] = [
  { key: "nature", label: "Природа и человек", description: "Природные зоны, явления, экология.", icon: "Star", gradient: "from-emerald-200 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/30", iconBg: "bg-emerald-300 dark:bg-emerald-700", iconColor: "text-emerald-800 dark:text-emerald-200", borderColor: "border-emerald-300 dark:border-emerald-700", dotColor: "bg-emerald-400", progressColor: "bg-emerald-400" },
  { key: "society", label: "Общество", description: "Страна, регион, права и обязанности.", icon: "Users", gradient: "from-sky-200 to-sky-100 dark:from-sky-900/40 dark:to-sky-800/30", iconBg: "bg-sky-300 dark:bg-sky-700", iconColor: "text-sky-800 dark:text-sky-200", borderColor: "border-sky-300 dark:border-sky-700", dotColor: "bg-sky-400", progressColor: "bg-sky-400" },
  { key: "history", label: "История родного края", description: "События, даты, памятники.", icon: "BookOpen", gradient: "from-amber-200 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/30", iconBg: "bg-amber-300 dark:bg-amber-700", iconColor: "text-amber-800 dark:text-amber-200", borderColor: "border-amber-300 dark:border-amber-700", dotColor: "bg-amber-400", progressColor: "bg-amber-400" },
  { key: "safety", label: "Безопасность", description: "Правила поведения дома и на улице.", icon: "Zap", gradient: "from-rose-200 to-rose-100 dark:from-rose-900/40 dark:to-rose-800/30", iconBg: "bg-rose-300 dark:bg-rose-700", iconColor: "text-rose-800 dark:text-rose-200", borderColor: "border-rose-300 dark:border-rose-700", dotColor: "bg-rose-400", progressColor: "bg-rose-400" },
  { key: "ecology", label: "Экология", description: "Охрана природы, взаимосвязи.", icon: "Puzzle", gradient: "from-teal-200 to-teal-100 dark:from-teal-900/40 dark:to-teal-800/30", iconBg: "bg-teal-300 dark:bg-teal-700", iconColor: "text-teal-800 dark:text-teal-200", borderColor: "border-teal-300 dark:border-teal-700", dotColor: "bg-teal-400", progressColor: "bg-teal-400" },
  { key: "geography", label: "География", description: "Карта, стороны света, формы рельефа.", icon: "MapPin", gradient: "from-indigo-200 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/30", iconBg: "bg-indigo-300 dark:bg-indigo-700", iconColor: "text-indigo-800 dark:text-indigo-200", borderColor: "border-indigo-300 dark:border-indigo-700", dotColor: "bg-indigo-400", progressColor: "bg-indigo-400" },
  { key: "time", label: "Время и календарь", description: "Часы, календарь, последовательность событий.", icon: "ListOrdered", gradient: "from-cyan-200 to-cyan-100 dark:from-cyan-900/40 dark:to-cyan-800/30", iconBg: "bg-cyan-300 dark:bg-cyan-700", iconColor: "text-cyan-800 dark:text-cyan-200", borderColor: "border-cyan-300 dark:border-cyan-700", dotColor: "bg-cyan-400", progressColor: "bg-cyan-400" },
  { key: "economy", label: "Экономика и труд", description: "Профессии, товары и услуги.", icon: "FileText", gradient: "from-fuchsia-200 to-fuchsia-100 dark:from-fuchsia-900/40 dark:to-fuchsia-800/30", iconBg: "bg-fuchsia-300 dark:bg-fuchsia-700", iconColor: "text-fuchsia-800 dark:text-fuchsia-200", borderColor: "border-fuchsia-300 dark:border-fuchsia-700", dotColor: "bg-fuchsia-400", progressColor: "bg-fuchsia-400" },
  { key: "health", label: "Здоровье", description: "ЗОЖ, режим дня, гигиена.", icon: "CheckCircle2", gradient: "from-orange-200 to-orange-100 dark:from-orange-900/40 dark:to-orange-800/30", iconBg: "bg-orange-300 dark:bg-orange-700", iconColor: "text-orange-800 dark:text-orange-200", borderColor: "border-orange-300 dark:border-orange-700", dotColor: "bg-orange-400", progressColor: "bg-orange-400" },
  { key: "experiments", label: "Наблюдения и опыты", description: "Простые опыты, выводы.", icon: "Search", gradient: "from-violet-200 to-violet-100 dark:from-violet-900/40 dark:to-violet-800/30", iconBg: "bg-violet-300 dark:bg-violet-700", iconColor: "text-violet-800 dark:text-violet-200", borderColor: "border-violet-300 dark:border-violet-700", dotColor: "bg-violet-400", progressColor: "bg-violet-400" },
];

const SUBJECTS_CONFIG: Record<SubjectId, SubjectIslandsConfig> = {
  russian: { name: "Русский язык", islands: russianIslands },
  math: { name: "Математика", islands: mathIslands },
  environment: { name: "Окружающий мир", islands: environmentIslands },
};

export function getSubjectConfig(subjectId: SubjectId): SubjectIslandsConfig {
  return SUBJECTS_CONFIG[subjectId] ?? SUBJECTS_CONFIG.russian;
}

export function getIslandsForSubject(subjectId: SubjectId): IslandConfig[] {
  return getSubjectConfig(subjectId).islands;
}

/** Список ключей категорий для диагностики и смешанного режима (порядок островов). */
export function getCategoriesForSubject(subjectId: SubjectId): string[] {
  return getIslandsForSubject(subjectId).map((i) => i.key);
}

/** Подписи категорий для UI (один навык). */
export function getCategoryLabelsForSubject(subjectId: SubjectId): Record<string, string> {
  const islands = getIslandsForSubject(subjectId);
  const labels: Record<string, string> = {};
  for (const i of islands) labels[i.key] = i.label;
  return labels;
}

export const SUBJECT_IDS: SubjectId[] = ["russian", "math", "environment"];
