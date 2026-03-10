"use strict";

// index.js — минимальный, автономный обработчик для Yandex Cloud Functions (Node.js)
// Без внешних и локальных импортов, только стандартная библиотека Node.

const { Readable } = require("stream");
const http = require("http");
const https = require("https");

// Разрешённый фронтенд-домен
const ALLOWED_ORIGIN = "https://buddy-vpr-static-natalia.storage.yandexcloud.net";

// Общие CORS-заголовки для разрешённого Origin
function getCorsHeaders(origin) {
  if (!origin || origin !== ALLOWED_ORIGIN) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With",
    Vary: "Origin",
  };
}

// Удобный конструктор JSON-ответов
function buildJsonResponse(statusCode, data, origin, extraHeaders) {
  const baseHeaders = {
    "Content-Type": "application/json; charset=utf-8",
  };

  const cors = getCorsHeaders(origin);
  const headers = Object.assign({}, baseHeaders, cors, extraHeaders || {});

  return {
    statusCode,
    headers,
    body: JSON.stringify(data),
  };
}

// Небольшой вспомогательный роутер
function routeRequest(method, path, body, origin) {
  // Простейший health-check
  if (method === "GET" && (path === "/" || path === "/api/health")) {
    return buildJsonResponse(
      200,
      {
        ok: true,
        message: "My Day Buddy backend is running",
        databaseUrlPresent: Boolean(process.env.DATABASE_URL),
      },
      origin
    );
  }

  // Заглушка для /api/tasks — чтобы фронт хотя бы что-то получил
  if (method === "GET" && path === "/api/tasks") {
    const tasks = [
      {
        id: 1,
        type: "grammar",
        title: "Найди подлежащее",
        question: "В каком слове подлежащее?",
        options: ["Кошка", "бежит", "быстро"],
        correctOptionIndex: 0,
      },
      {
        id: 2,
        type: "reading",
        title: "Чтение текста",
        question: "Прочитай небольшой текст и ответь на вопросы.",
        options: [],
        correctOptionIndex: null,
      },
    ];

    return buildJsonResponse(
      200,
      {
        source: "stub",
        items: tasks,
      },
      origin
    );
  }

  // Эхо-заглушка для остальных API-путей — чтобы не падать с 500,
  // но явно показать, что это не реализовано.
  if (path.startsWith("/api/")) {
    return buildJsonResponse(
      404,
      {
        error: "Not implemented",
        method,
        path,
      },
      origin
    );
  }

  // Для всех прочих путей возвращаем базовый ответ
  return buildJsonResponse(
    200,
    {
      ok: true,
      message: "Default handler response",
      method,
      path,
      echo: body ?? null,
    },
    origin
  );
}

// Основной обработчик функции Yandex Cloud
module.exports.handler = async function handler(event, context) {
  // Безопасное извлечение метода и пути с учётом разных форматов события
  const method = String(
    (event && event.httpMethod) ||
      (event && event.requestContext && event.requestContext.http && event.requestContext.http.method) ||
      "GET"
  ).toUpperCase();

  const path =
    (event && (event.rawPath || event.path)) ||
    (event && event.requestContext && event.requestContext.path) ||
    "/";

  const headers = (event && event.headers) || {};
  const origin = headers.origin || headers.Origin || "";

  // Обработка preflight-запросов CORS
  if (method === "OPTIONS") {
    const cors = getCorsHeaders(origin);

    // Если origin не разрешён — отвечаем 403 без CORS (или с минимальным набором)
    if (!cors["Access-Control-Allow-Origin"]) {
      return {
        statusCode: 403,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ error: "CORS origin forbidden" }),
      };
    }

    return {
      statusCode: 204,
      headers: Object.assign({}, cors, {
        "Content-Length": "0",
      }),
      body: "",
    };
  }

  // Разбор тела запроса (если есть)
  let parsedBody = null;
  if (event && event.body) {
    let raw = event.body;
    try {
      if (event.isBase64Encoded) {
        raw = Buffer.from(raw, "base64").toString("utf8");
      }

      // Пытаемся распарсить JSON, если это JSON
      try {
        parsedBody = JSON.parse(raw);
      } catch (e) {
        // Если это не JSON — возвращаем как строку
        parsedBody = raw;
      }
    } catch (e) {
      // В случае ошибки парсинга просто логируем и продолжаем
      console.error("Error parsing request body:", e);
      parsedBody = null;
    }
  }

  // Здесь можно добавить работу с БД, если нужно:
  // const dbUrl = process.env.DATABASE_URL;
  // Сейчас мы только проверяем наличие переменной, но не подключаемся к БД,
  // чтобы не ломать функцию при отсутствии драйверов.
  if (process.env.DATABASE_URL) {
    // console.log("DATABASE_URL is configured");
  }

  // Обработка основных методов
  switch (method) {
    case "GET":
    case "POST":
    case "PUT":
    case "DELETE":
      return routeRequest(method, path, parsedBody, origin);

    default:
      return buildJsonResponse(
        405,
        { error: "Method not allowed", method },
        origin,
        { Allow: "GET,POST,PUT,DELETE,OPTIONS" }
      );
  }
};
