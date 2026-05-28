import { z } from "zod";

export const reviewIssueTypeSchema = z.enum(["bug", "performance", "security"]);
export const reviewIssueSeveritySchema = z.enum(["low", "medium", "high"]);
const nullableLineSchema = z.union([z.coerce.number().int().positive(), z.null()]).optional();

export const reviewIssueSchema = z.object({
  type: reviewIssueTypeSchema,
  severity: reviewIssueSeveritySchema.default("medium"),
  line: nullableLineSchema,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  recommendation: z.string().trim().min(1),
});

export const reviewScoresSchema = z.object({
  complexity: z.coerce.number().min(0).max(100),
  security: z.coerce.number().min(0).max(100),
  overall: z.coerce.number().min(0).max(100),
});

export const reviewResultSchema = z.object({
  summary: z.string().trim().min(1),
  issues: z.array(reviewIssueSchema),
  scores: reviewScoresSchema,
  improvedCode: z.string(),
});

export const debugIssueSchema = z.object({
  line: nullableLineSchema,
  issue: z.string().trim().min(1),
  fix: z.string().trim().min(1),
});

export const debugResultSchema = z.object({
  errors: z.array(debugIssueSchema),
  fixed_code: z.string(),
  explanation: z.string().trim().min(1),
});

export type ReviewIssue = z.infer<typeof reviewIssueSchema>;
export type ReviewResult = z.infer<typeof reviewResultSchema>;
export type DebugIssue = z.infer<typeof debugIssueSchema>;
export type DebugResult = z.infer<typeof debugResultSchema>;

export type LLMRole = "system" | "user" | "assistant";

export interface LLMMessage {
  role: LLMRole;
  content: string;
}

export interface LLMContentPart {
  type?: string;
  text?: string;
}

export interface LLMChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | LLMContentPart[];
    };
  }>;
}
