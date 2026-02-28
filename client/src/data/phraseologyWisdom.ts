/**
 * Остров Мудрости (category: "meaning"): фразеологизмы + мини-сочинение (ВПР 2026, задание 12).
 * Только фразы по утверждённому списку: действия/поведение, характеристики, отношения, количество/время.
 * НЕ Остров Слов (vocabulary). module_id: island_wisdom_v1.
 */
import type { Task } from "@/lib/taskData";

const PHRASEOLOGY_HINT =
  "Подумай: что значит это выражение в переносном смысле? Вспомни ситуацию из жизни, где оно уместно. Проверь: ситуация этически корректна?";

function phraseologyTask(
  id: number,
  phrase: string,
  meaning: string,
  unacceptableSituations: string[],
  difficulty: "базовый" | "повышенный"
): Task {
  const difficultyNum = difficulty === "базовый" ? 1 : 2;
  const keywords = meaning
    .toLowerCase()
    .replace(/[.,!?;:«»""—–\-()]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 4);
  return {
    id,
    type: "meaning",
    word: phrase,
    question: `Объясни значение фразеологизма и приведи жизненную ситуацию, где он уместен.\n\n«${phrase}»`,
    correct: meaning,
    options: [],
    audio: meaning,
    hint: PHRASEOLOGY_HINT,
    rule: null,
    ruleId: 20,
    difficulty: difficultyNum,
    category: "meaning", // Остров Мудрости (не vocabulary = Остров Слов)
    inputType: "text",
    acceptableAnswers: [meaning],
    unacceptablePatterns: unacceptableSituations,
    keywords: keywords.length >= 2 ? keywords : [meaning.slice(0, 20)],
  };
}

const PHRASEOLOGY_ITEMS: Array<{
  phrase: string;
  meaning: string;
  unacceptable_situations: string[];
  difficulty: "базовый" | "повышенный";
}> = [
  // Действия и поведение
  { phrase: "Бить баклуши", meaning: "Бездельничать", unacceptable_situations: ["Когда ситуация поощряет лень в ущерб учёбе", "Когда обесценивается труд"], difficulty: "базовый" },
  { phrase: "Вставлять палки в колеса", meaning: "Мешать, создавать препятствия", unacceptable_situations: ["Когда речь о помощи", "Когда ситуация призывает помогать"], difficulty: "базовый" },
  { phrase: "Задирать нос", meaning: "Зазнаваться, вести себя высокомерно", unacceptable_situations: ["Когда говорят о скромности", "Когда хвалят успехи"], difficulty: "базовый" },
  { phrase: "Водить за нос", meaning: "Обманывать, вводить в заблуждение", unacceptable_situations: ["Когда речь о честной игре", "Когда помогают друг другу"], difficulty: "базовый" },
  { phrase: "Оказать медвежью услугу", meaning: "Услуга, причиняющая вред вместо пользы", unacceptable_situations: ["Когда помощь была уместной", "Когда говорят о настоящей поддержке"], difficulty: "повышенный" },
  { phrase: "Наломать дров", meaning: "Совершить ошибки, поступить опрометчиво", unacceptable_situations: ["Когда всё сделано правильно", "Когда хвалят осторожность"], difficulty: "базовый" },
  { phrase: "Толочь воду в ступе", meaning: "Заниматься бесполезным делом", unacceptable_situations: ["Когда дело приносит результат", "Когда говорят о важной работе"], difficulty: "базовый" },
  { phrase: "Чесать языки", meaning: "Болтать попусту, сплетничать", unacceptable_situations: ["Когда обсуждают важное", "Когда говорят о серьёзном разговоре"], difficulty: "базовый" },
  { phrase: "Дело в шляпе", meaning: "Дело завершено успешно, всё решено", unacceptable_situations: ["Когда дело ещё не сделано", "Когда всё только начинается"], difficulty: "базовый" },
  // Характеристики (ум, сила, скорость)
  { phrase: "Светлая голова", meaning: "Умный человек", unacceptable_situations: ["Когда говорят о глупом поступке", "Когда критикуют незнание"], difficulty: "базовый" },
  { phrase: "Ветер в голове", meaning: "Легкомысленный, несерьёзный человек", unacceptable_situations: ["Когда хвалят за ответственность", "Когда говорят о надёжности"], difficulty: "базовый" },
  { phrase: "Золотые руки", meaning: "Умелый мастер, тот, кто всё делает отлично", unacceptable_situations: ["Когда говорят о неумехе", "Когда критикуют качество работы"], difficulty: "базовый" },
  { phrase: "Семи пядей во лбу", meaning: "Очень умный, мудрый человек", unacceptable_situations: ["Когда говорят о глупости", "Когда ругают за ошибку"], difficulty: "повышенный" },
  { phrase: "Во все лопатки", meaning: "Очень быстро", unacceptable_situations: ["Когда говорят о медленной работе", "Когда хвалят за неторопливость"], difficulty: "базовый" },
  { phrase: "Черепашьим шагом", meaning: "Очень медленно", unacceptable_situations: ["Когда говорят о быстром результате", "Когда хвалят за скорость"], difficulty: "базовый" },
  { phrase: "Мокрая курица", meaning: "О безвольном, слабовольном человеке", unacceptable_situations: ["Когда хвалят за характер", "Когда говорят о силе воли"], difficulty: "повышенный" },
  // Отношения и чувства
  { phrase: "Водой не разольёшь", meaning: "Очень дружны, неразлучны", unacceptable_situations: ["Когда говорят о ссоре", "Когда люди не ладят"], difficulty: "базовый" },
  { phrase: "Белая ворона", meaning: "Кто-то сильно отличается от других", unacceptable_situations: ["Когда все одинаковые", "Когда говорят о типичном человеке"], difficulty: "базовый" },
  { phrase: "Держать ухо востро", meaning: "Быть внимательным, осторожным", unacceptable_situations: ["Когда призывают расслабиться", "Когда говорят о невнимательности"], difficulty: "базовый" },
  { phrase: "Беречь как зеницу ока", meaning: "Сильно заботиться, тщательно охранять", unacceptable_situations: ["Когда что-то бросают", "Когда не ценят"], difficulty: "повышенный" },
  { phrase: "Души не чаять", meaning: "Очень сильно любить", unacceptable_situations: ["Когда говорят о равнодушии", "Когда не любят"], difficulty: "базовый" },
  // Количественные и временные понятия
  { phrase: "Пруд пруди", meaning: "Очень много", unacceptable_situations: ["Когда мало", "Когда чего-то не хватает"], difficulty: "базовый" },
  { phrase: "Тьма-тьмущая", meaning: "Огромное количество", unacceptable_situations: ["Когда говорят о малом количестве", "Когда чего-то мало"], difficulty: "базовый" },
  { phrase: "С гулькин нос", meaning: "Очень мало", unacceptable_situations: ["Когда много", "Когда чего-то с избытком"], difficulty: "базовый" },
  { phrase: "Ни свет ни заря", meaning: "Очень рано", unacceptable_situations: ["Когда поздно", "Когда в разгар дня"], difficulty: "базовый" },
  { phrase: "Как снег на голову", meaning: "Неожиданно, внезапно", unacceptable_situations: ["Когда всё запланировано", "Когда ждали заранее"], difficulty: "базовый" },
  { phrase: "Кот наплакал", meaning: "Очень мало", unacceptable_situations: ["Когда много", "Когда достаточно"], difficulty: "базовый" },
];

const START_ID = 3031;

export const phraseologyWisdomTasks: Task[] = PHRASEOLOGY_ITEMS.map((item, i) =>
  phraseologyTask(
    START_ID + i,
    item.phrase,
    item.meaning,
    item.unacceptable_situations,
    item.difficulty
  )
);
