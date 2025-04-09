import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "3000");

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
  try {
    const server = await registerRoutes(app);

    // ✅ Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      log(`❌ Error: ${status} - ${message}`);
      if (status === 500) {
        console.error(err.stack);
      }
    });

    // ✅ Dev vs Prod setup
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ✅ Fixed server listening with proper error handling
    server.listen(port, "0.0.0.0", () => {
      log(`✅ Server is running on http://0.0.0.0:${port}`);
    }).on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        log(`❌ Port ${port} is already in use`);
      } else {
        log(`❌ Server error: ${err.message}`);
      }
      process.exit(1);
    });

  } catch (err) {
    log(`❌ Failed to start server: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
})();
