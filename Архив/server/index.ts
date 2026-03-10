import { createApp } from "./app";
import { serveStatic } from "./static";
import { log } from "./app";

(async () => {
  const { app, httpServer } = await createApp();
  if (!httpServer) {
    throw new Error("Expected httpServer for local run");
  }

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const basePort = parseInt(process.env.PORT || "5000", 10);
  let attempt = 0;
  const maxAttempts = 5;

  function tryListen() {
    const port = basePort + attempt;
    attempt += 1;
    httpServer.listen({ port, host: "0.0.0.0" }, () => {
      log(`serving on port ${port}`);
      if (process.env.NODE_ENV !== "production") {
        console.log("");
        console.log("  Откройте в браузере:");
        console.log(`  http://127.0.0.1:${port}`);
        console.log(`  http://localhost:${port}`);
        console.log("");
      }
    });
  }

  function onError(err: NodeJS.ErrnoException) {
    if (err.code === "EADDRINUSE" && attempt < maxAttempts) {
      log(`port ${basePort + attempt - 1} занят, пробуем ${basePort + attempt}...`);
      httpServer.once("error", onError);
      tryListen();
    } else {
      throw err;
    }
  }

  httpServer.once("error", onError);
  tryListen();
})();
