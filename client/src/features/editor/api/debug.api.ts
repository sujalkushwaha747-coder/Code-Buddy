import API from "../../../services/api";
import { normalizeCodeBlockContent } from "./review.api";

export type DebugIssue = {
  line: number | null;
  issue: string;
  fix: string;
};

export type DebugResult = {
  sourceType: "paste" | "repository";
  language: string;
  originalCode: string;
  errors: DebugIssue[];
  fixedCode: string;
  explanation: string;
  repositoryOwner?: string | null;
  repositoryName?: string | null;
  repositoryFullName?: string | null;
  filePath?: string | null;
};

type DebugApiResponse = {
  success: boolean;
  message: string;
  data: {
    sourceType?: string;
    language?: string;
    originalCode?: string;
    errors?: Array<{
      line?: number | null;
      issue?: string;
      fix?: string;
    }>;
    fixed_code?: string;
    fixedCode?: string;
    explanation?: string;
    repositoryOwner?: string | null;
    repositoryName?: string | null;
    repositoryFullName?: string | null;
    filePath?: string | null;
  };
};

export const normalizeDebugResult = (result: any): DebugResult => {
  const language = typeof result?.language === "string" ? result.language : "plaintext";

  return {
    sourceType: result?.sourceType === "repository" ? "repository" : "paste",
    language,
    originalCode: normalizeCodeBlockContent(result?.originalCode, language),
    errors: Array.isArray(result?.errors)
      ? result.errors.map((error: any) => ({
          line: typeof error?.line === "number" ? error.line : null,
          issue: typeof error?.issue === "string" ? error.issue : "Code issue detected",
          fix: typeof error?.fix === "string" ? error.fix : "Update the code to resolve the issue.",
        }))
      : [],
    fixedCode: normalizeCodeBlockContent(
      typeof result?.fixedCode === "string" ? result.fixedCode : result?.fixed_code,
      language,
    ),
    explanation:
      typeof result?.explanation === "string"
        ? result.explanation
        : "The submitted code was debugged and a corrected version was generated.",
    repositoryOwner:
      typeof result?.repositoryOwner === "string" ? result.repositoryOwner : null,
    repositoryName: typeof result?.repositoryName === "string" ? result.repositoryName : null,
    repositoryFullName:
      typeof result?.repositoryFullName === "string" ? result.repositoryFullName : null,
    filePath: typeof result?.filePath === "string" ? result.filePath : null,
  };
};

export const submitCodeDebug = async (data: {
  code: string;
  language: string;
}) => {
  const response = await API.post<DebugApiResponse>("/ai/debug", data);
  return {
    ...response.data,
    data: normalizeDebugResult(response.data.data),
  };
};
