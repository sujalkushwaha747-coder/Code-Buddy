import cors from "cors";

export const corsMiddleware = cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true,
});
