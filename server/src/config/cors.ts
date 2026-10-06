import cors from "cors";

const allowedOrigins = [
  "https://code-buddy-client-ezeo1yy3b-sujal-kushwahas-projects-36f27950.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

export const corsMiddleware = cors({
  origin: allowedOrigins,
  credentials: true,
});
