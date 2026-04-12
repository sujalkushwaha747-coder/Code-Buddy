import { z } from "zod";

export const analyzeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(10, "Code must be at least 10 characters long")
    .max(50000, "Code is too large to review"),
  language: z
    .string()
    .trim()
    .min(2, "Language is required")
    .max(30, "Language value is too long"),
});

export type AnalyzeRequest = z.infer<typeof analyzeSchema>;
