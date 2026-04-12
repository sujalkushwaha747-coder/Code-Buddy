import express from "express";
import morgan from "morgan";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes";
import aiRoutes from "./routes/ai.routes";
import userRoutes from "./routes/users.routes";
import githubRoutes from "./routes/github.routes";
import repositoryRoutes from "./routes/repositories.routes";
import reviewRoutes from "./routes/reviews.routes";

import { corsMiddleware } from "./config/cors";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";
import { attachRequestId } from "./middlewares/request-id.middleware";
import { createRateLimiter } from "./middlewares/rate-limit.middleware";
import { sanitizeRequest } from "./middlewares/sanitize.middleware";

const app = express();
const apiRateLimiter = createRateLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  message: "Too many requests. Please slow down and try again later.",
});

// ✅ CORS Middleware (allow frontend to communicate)
app.use(corsMiddleware);
app.use(attachRequestId);

// ✅ Core Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(express.json({ limit: "128kb" })); // parse JSON
app.use(express.urlencoded({ extended: false, limit: "32kb" }));
app.use(sanitizeRequest);
app.use(morgan("dev"));  // logging
app.use(apiRateLimiter);

// ✅ Health Check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server running 🚀",
    timestamp: new Date(),
  });
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/user", userRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/reviews", reviewRoutes);

// ✅ Fallback route (optional)
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestId: (req as any).requestId,
  });
});

app.use(errorHandler);

export default app;
