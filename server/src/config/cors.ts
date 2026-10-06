import cors from "cors";

const configuredOrigins = [
  "https://code-buddy-client-ezeo1yy3b-sujal-kushwahas-projects-36f27950.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  ...(process.env.FRONTEND_URL?.split(",") ?? []),
]
  .map((origin) => origin.trim())
  .filter(Boolean);

const vercelPreviewPatterns = [
  /^https:\/\/code-buddy(?:-[a-z0-9-]+)?\.vercel\.app$/,
  /^https:\/\/code-buddy-client(?:-[a-z0-9-]+)?\.vercel\.app$/,
];

const isAllowedOrigin = (origin?: string) => {
  if (!origin) {
    return true;
  }

  return (
    configuredOrigins.includes(origin) ||
    vercelPreviewPatterns.some((pattern) => pattern.test(origin))
  );
};

export const corsMiddleware = cors({
  origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
});
