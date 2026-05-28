import { debugCodeWithAI } from "../integrations/llm/llm-analysis.service";
import { parseLLMDebugResponse } from "../integrations/llm/llm.parser";

export const debugCode = async (code: string, language: string) => {
  const rawResponse = await debugCodeWithAI(code, language);
  return parseLLMDebugResponse(rawResponse, code);
};
