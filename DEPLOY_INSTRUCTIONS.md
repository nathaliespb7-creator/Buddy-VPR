### Деплой на Vercel

1. Убедись, что в `package.json` есть скрипт `"build"` (сейчас он настроен как `vite build`).
2. В настройках проекта на Vercel (`Settings -> General`) установи:
   - **Root Directory**: `.` (корень репозитория).
   - **Build Command**: `npm run build` (не `npm run build:client`).
   - **Output Directory**: `dist`.
3. В `Settings -> Environment Variables` на Vercel добавь:
   - `VITE_API_URL` — URL твоего бэкенда (например, `/api` или полный HTTP URL).
   - `DATABASE_URL` — актуальный PostgreSQL URL (без ссылок на Yandex Cloud).
4. Запусти новый деплой из интерфейса Vercel или сделай `git push` в ветку `main`.

