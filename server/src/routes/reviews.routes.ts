import { Router } from "express";
import {
  analyzeReview,
  fetchReviewHistory,
  fetchReviewInsights,
} from "../controllers/reviews.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { analyzeSchema } from "../validations/review.validation";

const router = Router();

router.post("/analyze", authenticate, validate(analyzeSchema), analyzeReview);
router.post("/code", authenticate, validate(analyzeSchema), analyzeReview);
router.get("/history", authenticate, fetchReviewHistory);
router.get("/insights", authenticate, fetchReviewInsights);

export default router;
