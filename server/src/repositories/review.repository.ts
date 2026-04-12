import prisma from "../config/prisma";
import type { ReviewResult } from "../integrations/llm/llm.types";
import type { CodeMetrics } from "../services/code-metrics.service";

type CreateStoredReviewInput = {
  userId: string;
  sourceType?: "paste" | "repository";
  language: string;
  originalCode: string;
  repositoryOwner?: string;
  repositoryName?: string;
  repositoryFullName?: string;
  filePath?: string;
  metrics: CodeMetrics;
  result: ReviewResult;
};

export const createStoredReview = async ({
  userId,
  sourceType = "paste",
  language,
  originalCode,
  repositoryOwner,
  repositoryName,
  repositoryFullName,
  filePath,
  metrics,
  result,
}: CreateStoredReviewInput) => {
  return prisma.codeReview.create({
    data: {
      userId,
      sourceType,
      language,
      originalCode,
      summary: result.summary,
      improvedCode: result.improvedCode,
      lineCount: metrics.lineCount,
      functionCount: metrics.functionCount,
      loopCount: metrics.loopCount,
      nestedLoopDepth: metrics.nestedLoopDepth,
      complexityApproximation: metrics.complexityApproximation,
      complexityScore: result.scores.complexity,
      securityScore: result.scores.security,
      overallScore: result.scores.overall,
      repositoryOwner,
      repositoryName,
      repositoryFullName,
      filePath,
      issues: {
        create: result.issues.map((issue) => ({
          type: issue.type,
          severity: issue.severity,
          line: issue.line ?? null,
          title: issue.title,
          description: issue.description,
          recommendation: issue.recommendation,
        })),
      },
    },
    include: {
      issues: true,
    },
  });
};

export const findReviewHistoryByUserId = async (userId: string) => {
  return prisma.codeReview.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      issues: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
};

export const findReviewInsightsByUserId = async (userId: string) => {
  return prisma.codeReview.findMany({
    where: { userId },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      createdAt: true,
      sourceType: true,
      language: true,
      complexityScore: true,
      securityScore: true,
      overallScore: true,
      lineCount: true,
      functionCount: true,
      loopCount: true,
      nestedLoopDepth: true,
      complexityApproximation: true,
      issues: {
        select: {
          type: true,
          severity: true,
        },
      },
    },
  });
};
