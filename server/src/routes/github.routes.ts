import { Router } from "express";
import {
  githubLogin,
  githubCallback,
  disconnectGithub,
  getGithubRepos,
} from "../controllers/github.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { createRateLimiter } from "../middlewares/rate-limit.middleware";

const router = Router();
const githubRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 30,
  message: "GitHub request rate limit reached. Please try again shortly.",
});

router.get("/login", githubRateLimiter, githubLogin);
router.get("/callback", githubRateLimiter, githubCallback);
router.get("/repos", githubRateLimiter, authenticate, getGithubRepos);
router.post("/disconnect", githubRateLimiter, authenticate, disconnectGithub);

export default router;
