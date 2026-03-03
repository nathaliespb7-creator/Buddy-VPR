# Бэкенд Buddy VPR на Yandex Cloud (Functions + Managed PostgreSQL)

Цель: развернуть API на Yandex Cloud (РФ), чтобы **buddyvpr.ru** и **buddyvpr.vercel.app** стабильно работали с новыми заданиями (в т.ч. остров «Предложения»).

---

## 1. Код

- **`server/app.ts`** — фабрика Express-приложения с CORS и seed (без `listen`).
- **`index.handler.ts`** (в корне репозитория) — обработчик Yandex Cloud Functions: обёртка Express, преобразует `event` HTTP-триггера в `req`/`res` и возвращает `{ statusCode, headers, body }`.
- **Seed (миграция)** уже в **`server/seed.ts`**: при первом запуске проверяется наличие заданий острова «Предложения» (маркер — слово «В лесу поют птицы и журчат ручьи.»). Если таких заданий нет, однократно добавляются все из `getSyntaxSentencesSeed()` (файл `server/data/island_sentences_v1.json`).
- **CORS**: в `server/app.ts` разрешены запросы с:
  - `https://buddyvpr.ru`
  - `https://www.buddyvpr.ru`
  - `https://buddyvpr.vercel.app`  
  Либо задаётся список через переменную окружения **`CORS_ORIGIN`** (через запятую).

---

## 2. База данных: Managed PostgreSQL в Яндекс Облаке

### 2.1. Создать кластер БД

1. Зайди в [консоль Yandex Cloud](https://console.cloud.yandex.ru).
2. Выбери каталог (или создай новый).
3. **Managed Service for PostgreSQL** → **Создать кластер**.
4. Параметры:
   - **Имя**: например `buddy-vpr-db`.
   - **Окружение**: Production или Development (на выбор).
   - **Версия PostgreSQL**: 15 или 16.
   - **Класс хоста**: минимальный (например `s2.small`) для старта.
   - **Размер хранилища**: 10–20 ГБ.
   - **Пользователь**: задай имя и пароль (запомни их).
   - **База данных**: создай БД, например `buddyvpr`.
5. Включи **Доступ из интернета** (или только из подсети, если функция будет в той же VPC).
6. Создай кластер и дождись статуса «Активен».

### 2.2. Получить DATABASE_URL

1. В карточке кластера открой **Подключение** (или список хостов).
2. Узнай **хост** (FQDN), **порт** (обычно 6432 для Managed PostgreSQL), **имя БД**, **пользователь**, **пароль**.
3. Строка подключения:
   ```text
   postgresql://<USER>:<PASSWORD>@<HOST>:6432/<DATABASE>?sslmode=require
   ```
   Пример:
   ```text
   postgresql://user1:MySecretPass@c-xxx.rw.mdb.yandexcloud.net:6432/buddyvpr?sslmode=require
   ```
4. Это значение понадобится как **`DATABASE_URL`** в переменных окружения функции.

### 2.3. Схема БД (миграции Drizzle)

Локально из корня проекта выполни (подставь свой `DATABASE_URL`):

```bash
DATABASE_URL="postgresql://..." npm run db:push
```

Так в облачной БД появятся таблицы из `shared/schema.ts` (golden_rules, task_content, session_state, category_rounds и т.д.). После первого вызова функции сработает seed: заполнятся правила и задания, включая остров «Предложения», если их ещё нет.

---

## 3. Yandex Cloud Function: пошаговый гайд

### 3.1. Создать функцию

1. В консоли Yandex Cloud: **Serverless** → **Cloud Functions**.
2. **Создать функцию**.
3. Имя: например `buddy-vpr-api`.
4. Описание (по желанию): «API для Buddy VPR».

### 3.2. Среда выполнения и код

1. **Среда**: Node.js 18 или 20.
2. **Способ загрузки кода**:
   - **Архив** — собери проект и залей zip (см. ниже).
   - Либо **репозиторий** (если подключён Git).

Сборка архива для загрузки (из корня репозитория):

```bash
# Установка зависимостей и сборка (если есть build для server)
npm install
# Собрать handler в один файл или оставить как есть — тогда в zip должны быть server/, shared/, index.handler.js
npx tsc --outDir dist-handler --skipLibCheck
# Или использовать esbuild для бандла (см. ниже)
```

Вариант **без бандла** (рекомендуется, чтобы seed нашёл `server/data/island_sentences_v1.json`):

1. В отдельной папке скопируй из репозитория: `server/`, `shared/`, `index.handler.ts`, `package.json`.
2. Выполни `npm install --production`.
3. Скомпилируй TypeScript в JS (если в консоли указан Node.js и путь к `.js`):
   ```bash
   npx tsc --outDir . --rootDir . --skipLibCheck
   ```
   Либо в консоли Yandex укажи точку входа на `.ts` и среду с поддержкой TypeScript (если есть).
4. Собери zip: корень папки должен содержать `index.handler.js` (или `.ts`), папки `server/` (с подпапкой `data/` и файлом `island_sentences_v1.json`), `shared/`, `node_modules/`.
5. Загрузи архив в функцию.

Если используешь **бандл** (esbuild), учти: путь к `server/data/island_sentences_v1.json` в рантайме может быть другим — тогда нужно встроить JSON в код или положить `data/` рядом с бандлом в zip.

3. **Точка входа**: `index.handler` (файл `index.handler.js` или `index.handler`, метод `handler`).

### 3.3. Триггер

1. **Триггер**: HTTP (или API Gateway, если используешь его).
2. Для HTTP-триггера после создания функции будет выдан **URL вызова**, вида:
   ```text
   https://functions.yandexcloud.net/<function_id>
   ```
   Его потом подставишь в Vercel как `VITE_API_URL`.

### 3.4. Переменные окружения

В настройках функции задай:

| Имя             | Значение                                                                 | Секрет |
|-----------------|--------------------------------------------------------------------------|--------|
| `DATABASE_URL`  | `postgresql://USER:PASSWORD@HOST:6432/DB?sslmode=require`                | Да     |
| `CORS_ORIGIN`   | `https://buddyvpr.ru,https://www.buddyvpr.ru,https://buddyvpr.vercel.app` | Нет    |

При необходимости добавь другие переменные (например, для логирования).

### 3.5. Таймаут и память

- **Таймаут**: не менее 30 секунд (первый запрос может долго выполняться из-за seed).
- **Память**: 512 МБ или 1 ГБ.

### 3.6. Получить URL функции

После создания HTTP-триггера скопируй **URL вызова** из консоли (например, `https://functions.yandexcloud.net/d4e...`). Он понадобится для шага 4.

---

## 4. Vercel: подставить URL API и сделать Redeploy

1. Зайди в [Vercel](https://vercel.com) → проект **Buddy-VPR**.
2. **Settings** → **Environment Variables**.
3. Добавь или измени переменную:
   - **Name**: `VITE_API_URL`
   - **Value**: URL твоей функции, например `https://functions.yandexcloud.net/d4e...` (без слэша в конце).
   - **Environment**: Production (и при необходимости Preview).
4. Сохрани.
5. **Deployments** → у последнего деплоя открой меню → **Redeploy** (или сделай новый коммит и пуш в `main`).

После редеплоя фронт на **buddyvpr.ru** и **buddyvpr.vercel.app** будет обращаться к API на Yandex Cloud. Проверь в браузере: остров «Предложения» и остальные данные должны подгружаться с бэкенда.

---

## 5. Краткий чек-лист

- [ ] Создан кластер Managed PostgreSQL, получен `DATABASE_URL`.
- [ ] Локально выполнен `db:push` с этим `DATABASE_URL`.
- [ ] Создана Cloud Function с точкой входа `index.handler`, загружен код (zip или репозиторий).
- [ ] Настроен HTTP-триггер, скопирован URL вызова.
- [ ] В функции заданы переменные `DATABASE_URL` (секрет) и `CORS_ORIGIN`.
- [ ] В Vercel задана переменная `VITE_API_URL` = URL функции, выполнен Redeploy.
- [ ] Проверка: открыть buddyvpr.ru, убедиться, что задания и остров «Предложения» загружаются.

---

## 6. Если что-то пошло не так

- **Функция возвращает 500** — смотри логи в консоли Yandex Cloud (Cloud Functions → функция → Логи). Часто это ошибка подключения к БД (неверный `DATABASE_URL` или сеть) или отсутствие таблиц (нужен `db:push`).
- **CORS** — убедись, что в `CORS_ORIGIN` указаны ровно те домены, с которых идёт запрос (без лишних пробелов).
- **Остров «Предложения» не появляется** — при первом запросе к API выполняется seed; проверь, что в БД есть таблица `task_content` и что в логах функции нет ошибок при вставке (например, из-за дублирования ключей).
