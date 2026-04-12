import { Request, Response } from "express";
import { hydrateStoredCodeMetrics } from "../services/code-metrics.service";
import {
  getReviewHistory,
  getReviewInsights,
  reviewCodeAndStore,
} from "../services/review.service";
import { resolveAuthenticatedUser } from "../services/user.service";

export const analyzeReview = async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    const authenticatedUser = await resolveAuthenticatedUser(req.user || req.auth);

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or expired. Please login again.",
      });
    }

    const storedReview = await reviewCodeAndStore(authenticatedUser.id, code, language);
    const metrics = hydrateStoredCodeMetrics({
      lineCount: storedReview.lineCount,
      functionCount: storedReview.functionCount,
      loopCount: storedReview.loopCount,
      nestedLoopDepth: storedReview.nestedLoopDepth,
      complexityApproximation: storedReview.complexityApproximation,
    });

    return res.json({
      success: true,
      message: "AI review generated successfully",
      data: {
        id: storedReview.id,
        sourceType: storedReview.sourceType,
        summary: storedReview.summary,
        issues: storedReview.issues,
        scores: {
          complexity: storedReview.complexityScore,
          security: storedReview.securityScore,
          overall: storedReview.overallScore,
        },
        improvedCode: storedReview.improvedCode,
        metrics,
        language: storedReview.language,
        originalCode: storedReview.originalCode,
        repositoryOwner: storedReview.repositoryOwner,
        repositoryName: storedReview.repositoryName,
        repositoryFullName: storedReview.repositoryFullName,
        filePath: storedReview.filePath,
        createdAt: storedReview.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Controller error:", error);

    const message =
      error?.message || "AI analysis failed";
    const statusCode = message.startsWith("LLM request failed")
      ? 502
      : message.startsWith("AI response parsing failed")
        ? 502
        : message.startsWith("LLM_API_KEY is not configured")
          ? 500
          : 500;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const fetchReviewHistory = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = await resolveAuthenticatedUser(req.user || req.auth);

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or expired. Please login again.",
      });
    }

    const history = await getReviewHistory(authenticatedUser.id);

    return res.json({
      success: true,
      message: "Review history fetched successfully",
      data: history.map((review) => {
        const metrics = hydrateStoredCodeMetrics({
          lineCount: review.lineCount,
          functionCount: review.functionCount,
          loopCount: review.loopCount,
          nestedLoopDepth: review.nestedLoopDepth,
          complexityApproximation: review.complexityApproximation,
        });

        return {
          id: review.id,
          sourceType: review.sourceType,
          language: review.language,
          originalCode: review.originalCode,
          summary: review.summary,
          improvedCode: review.improvedCode,
          metrics,
          repositoryOwner: review.repositoryOwner,
          repositoryName: review.repositoryName,
          repositoryFullName: review.repositoryFullName,
          filePath: review.filePath,
          scores: {
            complexity: review.complexityScore,
            security: review.securityScore,
            overall: review.overallScore,
          },
          issues: review.issues,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        };
      }),
    });
  } catch (error: any) {
    console.error("History fetch error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch review history",
    });
  }
};

export const fetchReviewInsights = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = await resolveAuthenticatedUser(req.user || req.auth);

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or expired. Please login again.",
      });
    }

    const insights = await getReviewInsights(authenticatedUser.id);

    return res.json({
      success: true,
      message: "Review insights fetched successfully",
      data: insights,
    });
  } catch (error: any) {
    console.error("Insights fetch error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch review insights",
    });
  }
};
