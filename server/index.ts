import express, { type Request, Response, NextFunction } from "express";
import cors from "cors"; // ✅ Import CORS
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// ✅ Enable CORS
const allowedOrigins = [
  "http://localhost:5173", // Dev frontend (Vite)
  "https://socialaigenius.work.gd", // Your production frontend domain
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow if no origin (e.g., curl) or origin is in list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // If using cookies/auth
}));

// ✅ JSON body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ✅ Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// ✅ Main entry async block
(async () => {
  const server = await registerRoutes(app);

  // ✅ Error handler middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // ✅ Setup frontend: Vite (dev) or static (prod)
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ✅ Start server with safe host for Windows
  const port = parseInt(process.env.PORT || "10000", 10);
  server.listen(
    {
      port,
      host: "localhost", // ✅ Changed from "0.0.0.0" to "localhost"
    },
    () => {
      log(`✅ Server is running on http://localhost:${port}`);
    }
  );
})();
