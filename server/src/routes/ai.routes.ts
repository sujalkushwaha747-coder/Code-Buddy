import { Router } from "express";

import { env } from "../config/env";
import { analyzeReview } from "../controllers/reviews.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { createRateLimiter } from "../middlewares/rate-limit.middleware";
import { validate } from "../middlewares/validate.middleware";
import { analyzeSchema } from "../validations/review.validation";

const router = Router();
const aiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: env.AI_RATE_LIMIT_MAX_REQUESTS,
  message: "AI review rate limit reached. Please wait and try again.",
});

router.post("/review", aiRateLimiter, authenticate, validate(analyzeSchema), analyzeReview);

export default router;
