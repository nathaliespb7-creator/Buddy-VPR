# Технические данные проекта Бадди ВПР

Актуально на момент составления. Дополняйте по мере изменений.

---

## 1. Стек

| Слой | Технологии |
|------|------------|
| **Frontend** | React 18, Vite 7, TypeScript 5.6 |
| **Стили** | Tailwind CSS 3.4, CSS-переменные (тема), Framer Motion 11 |
| **Роутинг** | wouter 3 |
| **Запросы** | TanStack React Query 5, fetch, таймаут 15 с |
| **Backend** | Express 5, Node (ESM, `"type": "module"`) |
| **БД** | PostgreSQL, Drizzle ORM |
| **Валидация** | Zod (shared, API) |
| **Сборка** | Vite (клиент), tsx/esbuild (сервер) |

---

## 2. Структура репозитория

```
├── client/                 # Фронтенд (React + Vite)
│   ├── index.html
│   ├── public/              # Статика: favicon, manifest.json, sw.js, data/
│   └── src/
│       ├── main.tsx, App.tsx
│       ├── pages/           # Home, not-found
│       ├── components/      # UI: Header, TaskCard, IslandMap, Mascot, и др.
│       ├── components/ui/   # Radix-based примитивы (button, dialog, tooltip…)
│       ├── lib/             # queryClient, taskData, utils, sentenceTypes, syntaxValidator
│       └── hooks/
├── server/                  # Бэкенд (Express)
│   ├── index.ts             # Точка входа, Vite middleware в dev
│   ├── routes.ts            # Регистрация API
│   ├── storage.ts           # Слой работы с БД (Drizzle)
│   ├── seed.ts              # Первичное заполнение БД + патч заданий «Остров предложений»
│   ├── vite.ts              # Подключение Vite в development
│   ├── static.ts            # Раздача dist/public в production
│   ├── data/                # island_sentences_v1.json
│   └── *Dictionary.ts       # Словари заданий для seed (accent, phonetics, morphemics)
├── shared/
│   └── schema.ts            # Drizzle-схема (таблицы, типы), используется server + drizzle-kit
├── tailwind.config.ts       # Конфиг Tailwind (content: client/)
├── vercel.json              # Деплой только клиента на Vercel
└── package.json
```

---

## 3. API (бэкенд)

Базовый URL: в dev при одном origin — пусто; при отдельном деплое фронта задаётся через **`VITE_API_URL`** (без слэша в конце).

| Метод | Путь | Назначение |
|-------|------|------------|
| GET | `/api/tasks` | Все задания |
| GET | `/api/tasks/:category` | Задания по категории |
| GET | `/api/rules` | Все правила |
| GET | `/api/rules/:category` | Правила по категории |
| GET | `/api/session/:sessionId` | Получить/создать сессию |
| PUT | `/api/session/:sessionId` | Обновить сессию |
| GET | `/api/round/:category?sessionId=` | Получить/создать раунд по категории |
| POST | `/api/round/:category/answer` | Отправить ответ (sessionId, taskId, correctFirstAttempt, attempts) |
| GET | `/api/round/:category/summary?sessionId=` | Итоги раунда (wrongWords, mastered) |
| GET | `/api/categories/progress?sessionId=` | Прогресс по всем категориям |
| GET | `/api/progress/:sessionId` | Прогресс сессии (legacy) |
| POST | `/api/progress` | Сохранить прогресс (legacy) |

Валидация: `sessionId` обязателен где указан; для ответа — zod-схема (sessionId, taskId, correctFirstAttempt, attempts).

---

## 4. База данных (PostgreSQL)

**Таблицы (Drizzle, `shared/schema.ts`):**

- **golden_rules** — подсказки по методикам (topic, category, magicHint, hints*).
- **task_content** — задания (type, word, question, correct, options[], audio, hint, rule, ruleId, difficulty, category).
- **session_state** — состояние сессии (sessionId, currentTaskIndex, totalScore, level, discoveryCompleted).
- **category_rounds** — раунды по категориям (sessionId, category, roundNumber, status, currentIndex, totalTasks, correctCount, wrongCount).
- **round_task_results** — результаты заданий в раунде (roundId, taskId, correctFirstAttempt, attempts, completedAt).
- **student_progress** — прогресс по заданиям (legacy).
- **users** — пользователи (пока не используются в основном потоке).

Seed при первом запуске заполняет правила и задания (в т.ч. из `server/data/island_sentences_v1.json`). Если БД уже заполнена, выполняется патч: при отсутствии заданий «Острова предложений» добавляются 15 из island_sentences_v1.

---

## 5. Клиент: данные и офлайн

- **Задания:** список с API `GET /api/tasks`; при ошибке или пустом ответе — fallback на **`tasksData`** из `client/src/lib/taskData.ts` (~50 заданий, 6 категорий).
- **Категории:** accent, phonetics, meaning, morphemics, morphology, syntax (острова: Ударения, Звуки, Мудрость, Слов-Конструктор, Части речи, Предложения).
- **Профиль/сессия:** `sessionId` и профиль (avatar, stars) в **localStorage** (ключи `buddy_session_id`, `buddy_profile`).
- **PWA:** `manifest.json` (standalone, theme #E6FFFA), **Service Worker** `sw.js` — кэш v1 для `/`, `/manifest.json`, `/favicon.png`; для `/api/*` при офлайне возвращает `{ error: "offline" }`; остальные GET — network-first с кэшем при успехе.

---

## 6. Деплой и окружение

| Окружение | Описание |
|-----------|----------|
| **Локальная разработка** | `npm run dev` — Express + Vite на порту 5000 (при занятости — 5001, 5002…). БД — локальный PostgreSQL. |
| **Production (фронт)** | Vercel: сборка `npm run build:client`, выход `dist/public`. Конфиг в `vercel.json` (rewrites на index.html, заголовки для index.html и sw.js). Домены: **buddyvpr.vercel.app**, **www.buddyvpr.ru**. |
| **Production (бэкенд)** | По документации не развёрнут. Планируется отдельный хостинг (Railway, Render, Yandex Cloud и т.д.); затем в Vercel задаётся `VITE_API_URL` и Redeploy. |

Переменные окружения:

- **VITE_API_URL** (опционально) — базовый URL API при деплое фронта отдельно от бэкенда.
- Сервер: стандартно **PORT** (по умолчанию 5000), переменные для подключения к PostgreSQL (через Drizzle/.env).

---

## 7. Ключевые файлы конфигурации

- **package.json:** скрипты `dev`, `build`, `build:client`, `start`, `check` (tsc), `db:push`.
- **vercel.json:** buildCommand, outputDirectory, rewrites, headers для index.html и sw.js.
- **tailwind.config.ts:** content по client/, тема (colors из CSS-переменных), fontFamily из var(--font-sans).
- **client/index.html:** lang="ru", viewport, theme-color #E6FFFA, шрифт Nunito (Google Fonts, асинхронно).

---

## 8. Дизайн и доступность

- Шрифт: **Nunito** (400, 600, 700).
- Цвета: CSS-переменные в `client/src/index.css` (--background, --foreground, --primary, --accent и др.), мятная палитра.
- Кнопки: min-height 48px (touch targets), скругления по дизайн-системе.
- Светлая тема по умолчанию (color-scheme: light); тёмная не включена в продакшене.

---

## 9. Дополнительные модули (контент)

- **Остров предложений (syntax):** JSON `server/data/island_sentences_v1.json` (15 заданий); типы и валидатор на клиенте: `client/src/lib/sentenceTypes.ts`, `client/src/lib/syntaxValidator.ts`. Задания конвертируются в формат seed и в taskData для офлайн fallback.
