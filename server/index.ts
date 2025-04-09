import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// ✅ Enable CORS for dev + prod frontend
const allowedOrigins = [
  "http://localhost:5173",
  "https://socialaigenius.work.gd"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ API request logger
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedJsonResponse = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 100) logLine = logLine.slice(0, 100) + "…";
      log(logLine);
    }
  });

  next();
});

// ✅ Async setup
(async () => {
  const server = await registerRoutes(app);

  // ✅ Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // ✅ Dev vs Prod setup
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ✅ FIX FOR WINDOWS: use "localhost" NOT "0.0.0.0"
  const port = parseInt(process.env.PORT || "10000", 10);
  server.listen(port, "localhost", () => {
    log(`✅ Server is running at http://localhost:${port}`);
  });
})();
