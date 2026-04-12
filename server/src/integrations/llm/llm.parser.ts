import { reviewResultSchema, ReviewResult } from "./llm.types";

const stripCodeFences = (value: string) =>
  value
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

const extractJsonObject = (value: string) => {
  const cleaned = stripCodeFences(value);
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("AI response did not contain a JSON object");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
};

const escapeControlCharactersInJsonStrings = (value: string) => {
  let result = "";
  let inString = false;
  let escaping = false;

  for (const char of value) {
    if (inString) {
      if (escaping) {
        result += char;
        escaping = false;
        continue;
      }

      if (char === "\\") {
        result += char;
        escaping = true;
        continue;
      }

      if (char === '"') {
        result += char;
        inString = false;
        continue;
      }

      if (char === "\n") {
        result += "\\n";
        continue;
      }

      if (char === "\r") {
        result += "\\r";
        continue;
      }

      if (char === "\t") {
        result += "\\t";
        continue;
      }

      if (char.charCodeAt(0) < 0x20) {
        result += `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;
        continue;
      }

      result += char;
      continue;
    }

    if (char === '"') {
      inString = true;
    }

    result += char;
  }

  return result;
};

const parseJsonWithRepair = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (_error) {
    const repairedValue = escapeControlCharactersInJsonStrings(value);
    try {
      return JSON.parse(repairedValue);
    } catch (_repairError) {
      return parseJsonWithTrailingCodeField(repairedValue);
    }
  }
};

const codeFieldNames = ["improvedCode", "suggestedCode", "refactoredCode"] as const;
const codeFieldPlaceholder = "__AI_CODE_FIELD_PLACEHOLDER__";

const decodeModelString = (value: string) =>
  value
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");

const extractTrailingCodeField = (value: string) => {
  for (const fieldName of codeFieldNames) {
    const pattern = new RegExp(
      `"${fieldName}"\\s*:\\s*"([\\s\\S]*)"\\s*}\\s*$`,
    );
    const match = value.match(pattern);

    if (!match) {
      continue;
    }

    return {
      fieldName,
      fieldValue: match[1],
      jsonWithoutCode: value.replace(
        pattern,
        `"${fieldName}":"${codeFieldPlaceholder}"}`
      ),
    };
  }

  return null;
};

const parseJsonWithTrailingCodeField = (value: string) => {
  const extracted = extractTrailingCodeField(value);

  if (!extracted) {
    throw new Error("Invalid JSON format");
  }

  const parsed = JSON.parse(extracted.jsonWithoutCode);
  parsed[extracted.fieldName] = decodeModelString(extracted.fieldValue);
  return parsed;
};

const normalizeIssueType = (value: unknown): "bug" | "performance" | "security" => {
  if (value === "performance" || value === "security") {
    return value;
  }

  return "bug";
};

const normalizeScore = (value: unknown, fallback: number) => {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, Math.round(numeric)));
};

const normalizeCodeMultiline = (value: unknown, fallback: string) => {
  const source = typeof value === "string" && value.length > 0 ? value : fallback;

  if (!source.includes("\n") && /\\r\\n|\\n|\\t/.test(source)) {
    return source
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "  ");
  }

  return source;
};

const normalizePayload = (payload: any, originalCode: string) => {
  const rawScores = payload?.scores || payload?.score || {};
  const complexity = normalizeScore(rawScores.complexity, 60);
  const security = normalizeScore(rawScores.security, 60);
  const overall = normalizeScore(
    rawScores.overall,
    Math.round((complexity + security) / 2),
  );

  const rawIssues = Array.isArray(payload?.issues) ? payload.issues : [];

  return {
    summary:
      payload?.summary ||
      payload?.overview ||
      "AI review completed successfully.",
    issues: rawIssues.map((issue: any) => ({
      type: normalizeIssueType(issue?.type),
      severity:
        issue?.severity === "low" ||
        issue?.severity === "medium" ||
        issue?.severity === "high"
          ? issue.severity
          : "medium",
      line:
        issue?.line === null || issue?.line === undefined
          ? null
          : Number(issue.line),
      title:
        issue?.title ||
        issue?.message ||
        issue?.issue ||
        "Code review issue",
      description:
        issue?.description ||
        issue?.message ||
        issue?.issue ||
        "Issue details were not provided by the AI response.",
      recommendation:
        issue?.recommendation ||
        issue?.fix ||
        issue?.suggestion ||
        "Review and update this code section.",
    })),
    scores: {
      complexity,
      security,
      overall,
    },
    improvedCode: normalizeCodeMultiline(
      payload?.improvedCode ||
        payload?.suggestedCode ||
        payload?.refactoredCode,
      originalCode,
    ),
  };
};

export const parseLLMResponse = (
  rawContent: string,
  originalCode: string,
): ReviewResult => {
  try {
    const jsonString = extractJsonObject(rawContent);
    const parsed = parseJsonWithRepair(jsonString);
    const normalized = normalizePayload(parsed, originalCode);

    return reviewResultSchema.parse(normalized);
  } catch (error: any) {
    throw new Error(
      `AI response parsing failed: ${error?.message || "Invalid JSON format"}`,
    );
  }
};
