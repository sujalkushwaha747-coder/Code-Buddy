import { z } from "zod";

export const reviewIssueTypeSchema = z.enum(["bug", "performance", "security"]);
export const reviewIssueSeveritySchema = z.enum(["low", "medium", "high"]);

export const reviewIssueSchema = z.object({
  type: reviewIssueTypeSchema,
  severity: reviewIssueSeveritySchema.default("medium"),
  line: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
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

export type ReviewIssue = z.infer<typeof reviewIssueSchema>;
export type ReviewResult = z.infer<typeof reviewResultSchema>;

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
