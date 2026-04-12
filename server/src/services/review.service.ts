import { analyzeCode } from "../integrations/llm/llm-analysis.service";
import { parseLLMResponse } from "../integrations/llm/llm.parser";
import {
  createStoredReview,
  findReviewHistoryByUserId,
  findReviewInsightsByUserId,
} from "../repositories/review.repository";
import { calculateCodeMetrics } from "./code-metrics.service";

export const reviewCode = async (code: string, language: string) => {
  const rawResponse = await analyzeCode(code, language);
  const result = parseLLMResponse(rawResponse, code);
  const metrics = calculateCodeMetrics(code);

  return {
    result,
    metrics,
  };
};

export const reviewCodeAndStore = async (
  userId: string,
  code: string,
  language: string,
) => {
  const { result, metrics } = await reviewCode(code, language);
  return createStoredReview({
    userId,
    language,
    originalCode: code,
    metrics,
    result,
  });
};

type ReviewRepositoryFileAndStoreInput = {
  userId: string;
  owner: string;
  repo: string;
  path: string;
  code: string;
  language: string;
};

export const reviewRepositoryFileAndStore = async ({
  userId,
  owner,
  repo,
  path,
  code,
  language,
}: ReviewRepositoryFileAndStoreInput) => {
  const { result, metrics } = await reviewCode(code, language);

  return createStoredReview({
    userId,
    sourceType: "repository",
    language,
    originalCode: code,
    repositoryOwner: owner,
    repositoryName: repo,
    repositoryFullName: `${owner}/${repo}`,
    filePath: path,
    metrics,
    result,
  });
};

export const getReviewHistory = async (userId: string) => {
  return findReviewHistoryByUserId(userId);
};

const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

const buildCountBreakdown = (items: string[]) =>
  Array.from(
    items.reduce((map, item) => {
      map.set(item, (map.get(item) || 0) + 1);
      return map;
    }, new Map<string, number>()),
  )
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

export const getReviewInsights = async (userId: string) => {
  const reviews = await findReviewInsightsByUserId(userId);
  const totalReviews = reviews.length;

  if (totalReviews === 0) {
    return {
      totals: {
        reviews: 0,
        issues: 0,
        pasteReviews: 0,
        repositoryReviews: 0,
      },
      averages: {
        complexityScore: 0,
        securityScore: 0,
        overallScore: 0,
        complexityApproximation: 0,
        lineCount: 0,
      },
      issueTypeBreakdown: [],
      languageBreakdown: [],
      sourceTypeBreakdown: [],
      securityTrend: [],
      reviewVolumeTrend: [],
      highlights: {
        mostCommonIssueType: null,
        highestSecurityScore: 0,
        nestedLoopHeavyReviews: 0,
      },
    };
  }

  const totals = reviews.reduce(
    (accumulator, review) => {
      accumulator.issues += review.issues.length;
      accumulator.pasteReviews += review.sourceType === "paste" ? 1 : 0;
      accumulator.repositoryReviews += review.sourceType === "repository" ? 1 : 0;
      accumulator.complexityScore += review.complexityScore;
      accumulator.securityScore += review.securityScore;
      accumulator.overallScore += review.overallScore;
      accumulator.complexityApproximation += review.complexityApproximation;
      accumulator.lineCount += review.lineCount;
      accumulator.nestedLoopHeavyReviews += review.nestedLoopDepth >= 2 ? 1 : 0;
      accumulator.highestSecurityScore = Math.max(
        accumulator.highestSecurityScore,
        review.securityScore,
      );
      return accumulator;
    },
    {
      issues: 0,
      pasteReviews: 0,
      repositoryReviews: 0,
      complexityScore: 0,
      securityScore: 0,
      overallScore: 0,
      complexityApproximation: 0,
      lineCount: 0,
      nestedLoopHeavyReviews: 0,
      highestSecurityScore: 0,
    },
  );

  const issueTypeBreakdown = buildCountBreakdown(
    reviews.flatMap((review) => review.issues.map((issue) => issue.type)),
  );
  const languageBreakdown = buildCountBreakdown(reviews.map((review) => review.language));
  const sourceTypeBreakdown = buildCountBreakdown(reviews.map((review) => review.sourceType));

  const securityTrend = reviews.slice(-8).map((review) => ({
    label: new Date(review.createdAt).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    createdAt: review.createdAt,
    score: review.securityScore,
  }));

  const reviewVolumeTrend = Array.from(
    reviews.reduce((map, review) => {
      const label = new Date(review.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      map.set(label, (map.get(label) || 0) + 1);
      return map;
    }, new Map<string, number>()),
  ).map(([label, count]) => ({
    label,
    count,
  }));

  return {
    totals: {
      reviews: totalReviews,
      issues: totals.issues,
      pasteReviews: totals.pasteReviews,
      repositoryReviews: totals.repositoryReviews,
    },
    averages: {
      complexityScore: roundToTwoDecimals(totals.complexityScore / totalReviews),
      securityScore: roundToTwoDecimals(totals.securityScore / totalReviews),
      overallScore: roundToTwoDecimals(totals.overallScore / totalReviews),
      complexityApproximation: roundToTwoDecimals(
        totals.complexityApproximation / totalReviews,
      ),
      lineCount: roundToTwoDecimals(totals.lineCount / totalReviews),
    },
    issueTypeBreakdown,
    languageBreakdown,
    sourceTypeBreakdown,
    securityTrend,
    reviewVolumeTrend,
    highlights: {
      mostCommonIssueType: issueTypeBreakdown[0]?.label || null,
      highestSecurityScore: totals.highestSecurityScore,
      nestedLoopHeavyReviews: totals.nestedLoopHeavyReviews,
    },
  };
};
