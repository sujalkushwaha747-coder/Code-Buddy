import { Router } from "express";

import {
  debugSelectedRepositoryFile,
  getRepositoryFile,
  listRepositoryFiles,
  reviewSelectedRepositoryFile,
} from "../controllers/repositories.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { createRateLimiter } from "../middlewares/rate-limit.middleware";
import { validate } from "../middlewares/validate.middleware";
import { repositoryFileReviewSchema } from "../validations/repository.validation";

const router = Router();
const repositoryRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 60,
  message: "Repository request rate limit reached. Please try again later.",
});

router.get("/:owner/:repo/files", repositoryRateLimiter, authenticate, listRepositoryFiles);
router.get("/:owner/:repo/file", repositoryRateLimiter, authenticate, getRepositoryFile);
router.post(
  "/review-file",
  repositoryRateLimiter,
  authenticate,
  validate(repositoryFileReviewSchema),
  reviewSelectedRepositoryFile,
);
router.post(
  "/debug-file",
  repositoryRateLimiter,
  authenticate,
  validate(repositoryFileReviewSchema),
  debugSelectedRepositoryFile,
);

export default router;
