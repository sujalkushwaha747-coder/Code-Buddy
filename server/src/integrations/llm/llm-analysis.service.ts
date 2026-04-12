import { requestChatCompletion } from "./llm.client";
import { buildCodeReviewMessages } from "./llm.prompts";

export const analyzeCode = async (code: string, language: string) => {
  const messages = buildCodeReviewMessages(code, language);
  return requestChatCompletion(messages);
};
