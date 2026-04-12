import { Router } from "express";
import { env } from "../config/env";
import { register, login } from "../controllers/auth.controller";
import { githubCallback, githubLogin } from "../controllers/github.controller";
import { createRateLimiter } from "../middlewares/rate-limit.middleware";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../validations/auth.validation";

const router = Router();

const authRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  message: "Too many authentication attempts. Please try again later.",
});

router.post("/register", authRateLimiter, validate(registerSchema), register);
router.post("/login", authRateLimiter, validate(loginSchema), login);
router.get("/github/login", githubLogin);
router.get("/github/callback", githubCallback);

export default router;
