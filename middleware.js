/**
 * Edge Middleware: задаёт Content-Type для главной страницы,
 * чтобы Safari/Яндекс не предлагали «Сохранить файл» вместо отображения.
 * Только передаёт запрос дальше с заголовками, тело ответа не меняет.
 */
import { next } from '@vercel/functions';

export default function middleware(request) {
  const pathname = new URL(request.url).pathname;
  if (pathname === '/' || pathname === '/index.html') {
    return next({
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }
  return next();
}
