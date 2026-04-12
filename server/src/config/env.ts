import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(5002),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().trim().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().trim().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().trim().min(2).default("7d"),
  GITHUB_CLIENT_ID: z.string().trim().optional().default(""),
  GITHUB_CLIENT_SECRET: z.string().trim().optional().default(""),
  GITHUB_CALLBACK_URL: z.string().trim().optional().default(""),
  LLM_API_URL: z.string().trim().url().default("https://api.groq.com/openai/v1"),
  LLM_API_KEY: z.string().trim().optional().default(""),
  LLM_MODEL: z.string().trim().default("llama-3.3-70b-versatile"),
  LLM_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(20000),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(120),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(10),
  AI_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(20),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Environment validation failed", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Invalid server environment configuration");
}

const insecureSecretPatterns = new Set([
  "supersecretjwtkey",
  "changeme",
  "secret",
  "jwtsecret",
]);

if (
  parsedEnv.data.NODE_ENV === "production" &&
  (parsedEnv.data.JWT_SECRET.length < 32 ||
    insecureSecretPatterns.has(parsedEnv.data.JWT_SECRET.toLowerCase()))
) {
  throw new Error("JWT_SECRET must be stronger before running in production");
}

if (
  parsedEnv.data.NODE_ENV !== "production" &&
  (parsedEnv.data.JWT_SECRET.length < 32 ||
    insecureSecretPatterns.has(parsedEnv.data.JWT_SECRET.toLowerCase()))
) {
  console.warn(
    "Security warning: JWT_SECRET is weak for development. Rotate it before production deployment.",
  );
}

export const env = parsedEnv.data;
