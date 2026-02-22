# Быстрый старт — Бадди ВПР

Запуск проекта на своём компьютере за пару минут.

---

## 1. Установка зависимостей

```bash
npm install
```

## 2. Запуск в режиме разработки

```bash
npm run dev
```

Приложение откроется по адресу: **http://127.0.0.1:5000**

## 3. Остальное

| Действие              | Команда              |
|-----------------------|----------------------|
| Сборка всего проекта  | `npm run build`      |
| Только фронтенд       | `npm run build:client` |
| Проверка типов (TypeScript) | `npm run check` |
| Запуск прод-сборки    | `npm run start` (после `npm run build`) |

---

## Команды деплоя (Vercel)

Деплой идёт автоматически после **push** в GitHub. Выполняй в терминале из папки проекта:

```bash
cd /Users/nathalie/Buddy-VPR
git add .
git status
git commit -m "описание изменений"
git push
```

Если при `git push` ошибка **401** — см. **docs/GIT-GITHUB.md** (токен в `.github-token-buddy`):

```bash
cd /Users/nathalie/Buddy-VPR
git remote set-url origin "https://nathaliespb7-creator:$(cat .github-token-buddy)@github.com/nathaliespb7-creator/Buddy-VPR.git"
git push -u origin main
git remote set-url origin https://github.com/nathaliespb7-creator/Buddy-VPR.git
```

После push зайди в **Vercel** → проект **Buddy-VPR** → вкладка **Deployments**. Дождись статуса **Ready**. Сайт: **https://buddyvpr.vercel.app**

---

Подробнее: **docs/CONTEXT.md**, деплой и домен: **docs/DEPLOY-VERCEL.md**.
