import cors from "cors";

const allowedOrigins = [
  "https://code-buddy-client-ezeo1yy3b-sujal-kushwahas-projects-36f27950.vercel.app/",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

export const corsMiddleware = cors({
  origin: allowedOrigins,
  credentials: true,
});
