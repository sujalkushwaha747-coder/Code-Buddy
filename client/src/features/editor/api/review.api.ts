import API from "../../../services/api";

export type ReviewIssueType = "bug" | "performance" | "security";
export type ReviewIssueSeverity = "low" | "medium" | "high";

export type ReviewIssue = {
  type: ReviewIssueType;
  severity: ReviewIssueSeverity;
  line: number | null;
  title: string;
  description: string;
  recommendation: string;
};

export type ReviewMetrics = {
  lineCount: number;
  functionCount: number;
  loopCount: number;
  nestedLoopDepth: number;
  complexityApproximation: number;
  optimizationInsights: string[];
};

export type ReviewResult = {
  summary: string;
  issues: ReviewIssue[];
  scores: {
    complexity: number;
    security: number;
    overall: number;
  };
  improvedCode: string;
  metrics: ReviewMetrics;
};

export type StoredReviewResult = ReviewResult & {
  id: string;
  sourceType: "paste" | "repository";
  language: string;
  originalCode: string;
  createdAt: string;
  repositoryOwner?: string | null;
  repositoryName?: string | null;
  repositoryFullName?: string | null;
  filePath?: string | null;
};

export type ReviewApiResponse = {
  success: boolean;
  message: string;
  data: StoredReviewResult;
};

const braceStyleLanguages = new Set([
  "javascript",
  "typescript",
  "java",
  "cpp",
  "c",
  "csharp",
  "php",
  "go",
  "rust",
  "kotlin",
  "swift",
]);

const languageLabels: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  c: "C",
  csharp: "C#",
  php: "PHP",
  go: "Go",
  rust: "Rust",
  kotlin: "Kotlin",
  swift: "Swift",
};

const defaultReviewMetrics: ReviewMetrics = {
  lineCount: 0,
  functionCount: 0,
  loopCount: 0,
  nestedLoopDepth: 0,
  complexityApproximation: 1,
  optimizationInsights: [
    "Metrics are not available for this review yet. Run the latest backend and review again to store full metrics.",
  ],
};

export const formatLanguageLabel = (language?: string) => {
  const normalizedLanguage = typeof language === "string" ? language.toLowerCase() : "";

  if (languageLabels[normalizedLanguage]) {
    return languageLabels[normalizedLanguage];
  }

  if (!normalizedLanguage) {
    return "Plain Text";
  }

  return normalizedLanguage.charAt(0).toUpperCase() + normalizedLanguage.slice(1);
};

const formatBraceLanguageCode = (source: string) => {
  const compactSource = source.replace(/\s+/g, " ").trim();

  if (!compactSource) {
    return compactSource;
  }

  let formatted = "";
  let indentDepth = 0;
  let parenthesisDepth = 0;
  let activeQuote: '"' | "'" | "`" | null = null;
  let escaping = false;
  let lineStart = true;

  const writeIndent = () => {
    if (!lineStart) {
      return;
    }

    formatted += "  ".repeat(Math.max(indentDepth, 0));
    lineStart = false;
  };

  const writeChar = (char: string) => {
    writeIndent();
    formatted += char;
  };

  const writeSpace = () => {
    if (!lineStart && !formatted.endsWith(" ") && !formatted.endsWith("\n")) {
      formatted += " ";
    }
  };

  const writeNewLine = () => {
    formatted = formatted.replace(/[ \t]+$/g, "");

    if (!formatted.endsWith("\n")) {
      formatted += "\n";
    }

    lineStart = true;
  };

  const getNextVisibleChar = (index: number) => {
    for (let cursor = index + 1; cursor < compactSource.length; cursor += 1) {
      const nextChar = compactSource[cursor];

      if (!/\s/.test(nextChar)) {
        return nextChar;
      }
    }

    return "";
  };

  for (let index = 0; index < compactSource.length; index += 1) {
    const char = compactSource[index];

    if (activeQuote) {
      writeChar(char);

      if (escaping) {
        escaping = false;
        continue;
      }

      if (char === "\\") {
        escaping = true;
        continue;
      }

      if (char === activeQuote) {
        activeQuote = null;
      }

      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      activeQuote = char;
      writeChar(char);
      continue;
    }

    if (/\s/.test(char)) {
      writeSpace();
      continue;
    }

    if (char === "(") {
      parenthesisDepth += 1;
      writeChar(char);
      continue;
    }

    if (char === ")") {
      parenthesisDepth = Math.max(0, parenthesisDepth - 1);
      writeChar(char);
      continue;
    }

    if (char === "{") {
      writeChar(char);
      indentDepth += 1;
      writeNewLine();
      continue;
    }

    if (char === "}") {
      if (!lineStart) {
        writeNewLine();
      }

      indentDepth = Math.max(0, indentDepth - 1);
      writeChar(char);

      if (getNextVisibleChar(index)) {
        writeNewLine();
      }

      continue;
    }

    if (char === ";") {
      writeChar(char);

      if (parenthesisDepth === 0) {
        writeNewLine();
      } else {
        writeSpace();
      }

      continue;
    }

    writeChar(char);
  }

  return formatted.trim() || source;
};

export const normalizeCodeBlockContent = (value: unknown, language = "plaintext") => {
  let source = typeof value === "string" ? value : "";

  source = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  if (!source.includes("\n") && /\\r\\n|\\n|\\t/.test(source)) {
    source = source
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "  ");
  }

  if (!source.includes("\n") && braceStyleLanguages.has(language.toLowerCase()) && /[{};]/.test(source)) {
    return formatBraceLanguageCode(source);
  }

  return source;
};

const normalizeNumber = (value: unknown, fallback = 0) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const normalizeIssueType = (value: unknown): ReviewIssueType => {
  if (value === "bug" || value === "performance" || value === "security") {
    return value;
  }

  return "bug";
};

const normalizeIssueSeverity = (value: unknown): ReviewIssueSeverity => {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return "medium";
};

export const normalizeReviewMetrics = (metrics?: Partial<ReviewMetrics> | null): ReviewMetrics => {
  const insights = Array.isArray(metrics?.optimizationInsights)
    ? metrics.optimizationInsights.filter(
        (insight): insight is string =>
          typeof insight === "string" && insight.trim().length > 0,
      )
    : [];

  return {
    lineCount: normalizeNumber(metrics?.lineCount, defaultReviewMetrics.lineCount),
    functionCount: normalizeNumber(metrics?.functionCount, defaultReviewMetrics.functionCount),
    loopCount: normalizeNumber(metrics?.loopCount, defaultReviewMetrics.loopCount),
    nestedLoopDepth: normalizeNumber(
      metrics?.nestedLoopDepth,
      defaultReviewMetrics.nestedLoopDepth,
    ),
    complexityApproximation: normalizeNumber(
      metrics?.complexityApproximation,
      defaultReviewMetrics.complexityApproximation,
    ),
    optimizationInsights:
      insights.length > 0 ? insights : defaultReviewMetrics.optimizationInsights,
  };
};

const normalizeReviewIssues = (issues: unknown): ReviewIssue[] =>
  Array.isArray(issues)
    ? issues.map((issue: any) => ({
        type: normalizeIssueType(issue?.type),
        severity: normalizeIssueSeverity(issue?.severity),
        line: typeof issue?.line === "number" ? issue.line : null,
        title: typeof issue?.title === "string" ? issue.title : "Untitled issue",
        description:
          typeof issue?.description === "string"
            ? issue.description
            : "No description provided.",
        recommendation:
          typeof issue?.recommendation === "string"
            ? issue.recommendation
            : "No recommendation provided.",
      }))
    : [];

export const normalizeStoredReviewResult = (review: any): StoredReviewResult => {
  const language = typeof review?.language === "string" ? review.language : "plaintext";

  return {
    id: typeof review?.id === "string" ? review.id : "",
    sourceType: review?.sourceType === "repository" ? "repository" : "paste",
    language,
    originalCode: normalizeCodeBlockContent(review?.originalCode, language),
    createdAt:
      typeof review?.createdAt === "string" ? review.createdAt : new Date(0).toISOString(),
    repositoryOwner:
      typeof review?.repositoryOwner === "string" ? review.repositoryOwner : null,
    repositoryName: typeof review?.repositoryName === "string" ? review.repositoryName : null,
    repositoryFullName:
      typeof review?.repositoryFullName === "string" ? review.repositoryFullName : null,
    filePath: typeof review?.filePath === "string" ? review.filePath : null,
    summary:
      typeof review?.summary === "string" ? review.summary : "No review summary available.",
    issues: normalizeReviewIssues(review?.issues),
    scores: {
      complexity: normalizeNumber(review?.scores?.complexity),
      security: normalizeNumber(review?.scores?.security),
      overall: normalizeNumber(review?.scores?.overall),
    },
    improvedCode: normalizeCodeBlockContent(review?.improvedCode, language),
    metrics: normalizeReviewMetrics(review?.metrics),
  };
};

export const submitCodeReview = async (data: {
  code: string;
  language: string;
}) => {
  const response = await API.post<ReviewApiResponse>("/ai/review", data);
  return {
    ...response.data,
    data: normalizeStoredReviewResult(response.data.data),
  };
};
