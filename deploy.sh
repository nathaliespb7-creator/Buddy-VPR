#!/bin/bash
echo "🚀 Запуск сборки..."
npm run build:client
if [ $? -eq 0 ]; then
  echo "✅ Сборка прошла успешно! Файлы в папке dist/public"
  echo "👉 Теперь открой Finder, найди папку Buddy-VPR/dist/public, выдели все файлы (Cmd+A) и перетащи их в консоль Яндекс Облака."
else
  echo "❌ Ошибка сборки!"
fi
