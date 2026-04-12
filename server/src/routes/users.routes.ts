import { Router } from "express";
import { getProfile } from "../controllers/users.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/profile", authenticate, getProfile);

export default router;
