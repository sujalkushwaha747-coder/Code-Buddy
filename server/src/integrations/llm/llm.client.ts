import axios from "axios";

import { aiConfig, ensureAiConfigured } from "../../config/ai";
import { LLMChatCompletionResponse, LLMMessage } from "./llm.types";

const llmClient = axios.create({
  baseURL: aiConfig.apiUrl,
  timeout: aiConfig.timeoutMs,
  headers: {
    "Content-Type": "application/json",
  },
});

const extractTextContent = (payload: LLMChatCompletionResponse) => {
  const content = payload.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part.text || ""))
      .join("")
      .trim();
  }

  return "";
};

export const requestChatCompletion = async (
  messages: LLMMessage[],
): Promise<string> => {
  ensureAiConfigured();

  try {
    const response = await llmClient.post<LLMChatCompletionResponse>(
      "/chat/completions",
      {
        model: aiConfig.model,
        temperature: aiConfig.temperature,
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${aiConfig.apiKey}`,
        },
      },
    );

    const content = extractTextContent(response.data);

    if (!content) {
      throw new Error("LLM returned an empty response");
    }

    return content;
  } catch (error: any) {
    const providerMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Unknown LLM error";

    throw new Error(`LLM request failed: ${providerMessage}`);
  }
};
