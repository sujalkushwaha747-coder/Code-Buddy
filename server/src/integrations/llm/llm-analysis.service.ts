import { requestChatCompletion } from "./llm.client";
import { buildCodeDebugMessages, buildCodeReviewMessages } from "./llm.prompts";

export const analyzeCode = async (code: string, language: string) => {
  const messages = buildCodeReviewMessages(code, language);
  return requestChatCompletion(messages);
};

export const debugCodeWithAI = async (code: string, language: string) => {
  const messages = buildCodeDebugMessages(code, language);
  return requestChatCompletion(messages);
};
