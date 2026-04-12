import { env } from "./env";

export const aiConfig = {
  apiUrl: env.LLM_API_URL.replace(/\/+$/, ""),
  apiKey: env.LLM_API_KEY.trim(),
  model: env.LLM_MODEL.trim(),
  timeoutMs: env.LLM_TIMEOUT_MS,
  temperature: 0.2,
};

export const ensureAiConfigured = () => {
  if (!aiConfig.apiKey) {
    throw new Error("LLM_API_KEY is not configured");
  }
};
