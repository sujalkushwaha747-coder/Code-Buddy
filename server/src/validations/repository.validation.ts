import { z } from "zod";

export const repositoryParamsSchema = z.object({
  owner: z.string().trim().min(1).max(100),
  repo: z.string().trim().min(1).max(100),
});

export const repositoryFileQuerySchema = z.object({
  path: z.string().trim().min(1).max(500),
});

export const repositoryContentsQuerySchema = z.object({
  path: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => value || ""),
});

export const repositoryFileReviewSchema = z.object({
  owner: z.string().trim().min(1).max(100),
  repo: z.string().trim().min(1).max(100),
  path: z.string().trim().min(1).max(500),
});

export type RepositoryParamsInput = z.infer<typeof repositoryParamsSchema>;
export type RepositoryFileQueryInput = z.infer<typeof repositoryFileQuerySchema>;
export type RepositoryContentsQueryInput = z.infer<typeof repositoryContentsQuerySchema>;
export type RepositoryFileReviewInput = z.infer<typeof repositoryFileReviewSchema>;
