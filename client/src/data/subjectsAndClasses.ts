/**
 * Конфигурация классов и предметов для выбора на странице ClassSubjectSelector.
 * Используется для отображения списков «Класс» и «Предмет»; острова по предметам — для будущей фильтрации заданий.
 */

export const CLASSES = [4, 5, 6, 7, 8] as const;
export type ClassGrade = (typeof CLASSES)[number];

export interface SubjectIsland {
  key: string;
  label: string;
  description: string;
}

export interface SubjectConfig {
  id: string;
  name: string;
  /** Острова (темы) по предмету. Для MVP у Математики и Окружающего мира — заглушки. */
  islands: SubjectIsland[];
}

/** Русский язык 4 класс — острова совпадают с ключами в IslandMap и taskData. */
export const SUBJECTS: SubjectConfig[] = [
  {
    id: "russian",
    name: "Русский язык",
    islands: [
      { key: "accent", label: "Остров Ударений", description: "Найди секретную силу каждого слова!" },
      { key: "phonetics", label: "Остров Звуков", description: "Узнай, как звуки прячутся в буквах!" },
      { key: "morphemics", label: "Остров Слов-Конструктор", description: "Разбери слова на части: корень, приставка, суффикс!" },
      { key: "morphology", label: "Остров Частей Речи", description: "Узнай, кто такие глагол, существительное и их друзья!" },
      { key: "syntax", label: "Остров Предложений", description: "Найди подлежащее, сказуемое и расставь запятые!" },
      { key: "vocabulary", label: "Остров Слов", description: "Подбери слово с таким же значением (синоним)!" },
      { key: "context", label: "Остров контекста", description: "Объясни, что значит слово в предложении!" },
      { key: "plan", label: "Остров Планов", description: "Составь план текста из 3 пунктов!" },
      { key: "phraseology", label: "Остров Фразеологизмов", description: "Узнай значение устойчивых выражений!" },
      { key: "meaning", label: "Остров Мудрости", description: "Разгадай тайны пословиц и слов!" },
      { key: "reading", label: "Остров Текстов", description: "Прочитай текст и найди главную мысль!" },
    ],
  },
  {
    id: "math",
    name: "Математика",
    islands: [
      { key: "numbers", label: "Числа и величины", description: "Работа с числами, сравнение, округление." },
      { key: "arithmetic", label: "Арифметика", description: "Действия с числами, порядок действий." },
      { key: "geometry", label: "Геометрия", description: "Фигуры, площадь, периметр." },
      { key: "text", label: "Текстовые задачи", description: "Решение задач на движение, работу и др." },
      { key: "data", label: "Данные и вероятности", description: "Таблицы, диаграммы, простейшая вероятность." },
    ],
  },
  {
    id: "environment",
    name: "Окружающий мир",
    islands: [
      { key: "nature", label: "Природа и человек", description: "Природные зоны, явления, экология." },
      { key: "society", label: "Общество", description: "Страна, регион, права и обязанности." },
      { key: "history", label: "История родного края", description: "События, даты, памятники." },
      { key: "safety", label: "Безопасность", description: "Правила поведения дома и на улице." },
    ],
  },
];
