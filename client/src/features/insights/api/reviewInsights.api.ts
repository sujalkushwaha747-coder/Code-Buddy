import API from "../../../services/api";
import { fetchReviewHistory, type ReviewHistoryItem } from "../../reviews/api/reviewHistory.api";

export type BreakdownItem = {
  label: string;
  count: number;
};

export type SecurityTrendPoint = {
  label: string;
  createdAt: string;
  score: number;
};

export type ReviewVolumePoint = {
  label: string;
  count: number;
};

export type ReviewInsights = {
  totals: {
    reviews: number;
    issues: number;
    pasteReviews: number;
    repositoryReviews: number;
  };
  averages: {
    complexityScore: number;
    securityScore: number;
    overallScore: number;
    complexityApproximation: number;
    lineCount: number;
  };
  issueTypeBreakdown: BreakdownItem[];
  languageBreakdown: BreakdownItem[];
  sourceTypeBreakdown: BreakdownItem[];
  securityTrend: SecurityTrendPoint[];
  reviewVolumeTrend: ReviewVolumePoint[];
  highlights: {
    mostCommonIssueType: string | null;
    highestSecurityScore: number;
    nestedLoopHeavyReviews: number;
  };
};

type ReviewInsightsResponse = {
  success: boolean;
  message: string;
  data: ReviewInsights;
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

const buildInsightsFromHistory = (history: ReviewHistoryItem[]): ReviewInsights => {
  const reviews = [...history].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
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
      accumulator.complexityScore += review.scores.complexity;
      accumulator.securityScore += review.scores.security;
      accumulator.overallScore += review.scores.overall;
      accumulator.complexityApproximation += review.metrics.complexityApproximation;
      accumulator.lineCount += review.metrics.lineCount;
      accumulator.nestedLoopHeavyReviews += review.metrics.nestedLoopDepth >= 2 ? 1 : 0;
      accumulator.highestSecurityScore = Math.max(
        accumulator.highestSecurityScore,
        review.scores.security,
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
    score: review.scores.security,
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

export const fetchReviewInsights = async () => {
  try {
    const response = await API.get<ReviewInsightsResponse>("/reviews/insights");
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status === 404 || message === "Route not found") {
      const historyResponse = await fetchReviewHistory();

      return {
        success: true,
        message: "Review insights built from review history",
        data: buildInsightsFromHistory(historyResponse.data),
      };
    }

    throw error;
  }
};
