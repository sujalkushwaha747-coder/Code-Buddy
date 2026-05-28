import { Request, Response } from "express";
import { hydrateStoredCodeMetrics } from "../services/code-metrics.service";
import {
  debugRepositoryFile,
  fetchRepositoryFileContent,
  fetchRepositoryFiles,
  reviewRepositoryFile,
} from "../services/repository.service";
import { clearUserGithubToken, resolveAuthenticatedUser } from "../services/user.service";
import {
  repositoryContentsQuerySchema,
  repositoryFileQuerySchema,
  repositoryFileReviewSchema,
  repositoryParamsSchema,
} from "../validations/repository.validation";

const resolveGithubToken = async (req: Request) => {
  const authenticatedUser = await resolveAuthenticatedUser(req.user || req.auth);

  if (!authenticatedUser) {
    return {
      user: null,
      githubToken: null,
    };
  }

  return {
    user: authenticatedUser,
    githubToken: authenticatedUser.githubToken || null,
  };
};

export const listRepositoryFiles = async (req: Request, res: Response) => {
  let currentUserId: string | null = null;

  try {
    const { owner, repo } = repositoryParamsSchema.parse(req.params);
    const { path } = repositoryContentsQuerySchema.parse(req.query);
    const { user, githubToken } = await resolveGithubToken(req);
    currentUserId = user?.id || null;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or expired. Please login again.",
      });
    }

    if (!githubToken) {
      return res.status(400).json({
        success: false,
        message: "Connect GitHub first to load repository files.",
      });
    }

    const files = await fetchRepositoryFiles(owner, repo, githubToken, path);

    return res.json({
      success: true,
      message: "Repository contents fetched successfully",
      data: files,
    });
  } catch (error: any) {
    if (currentUserId && (error?.response?.status === 401 || error?.response?.status === 403)) {
      await clearUserGithubToken(currentUserId);

      return res.status(400).json({
        success: false,
        message: "GitHub access expired or was revoked. Connect GitHub again.",
      });
    }

    const statusCode = error?.name === "ZodError" ? 400 : 500;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch repository files";

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const getRepositoryFile = async (req: Request, res: Response) => {
  let currentUserId: string | null = null;

  try {
    const { owner, repo } = repositoryParamsSchema.parse(req.params);
    const { path } = repositoryFileQuerySchema.parse(req.query);
    const { user, githubToken } = await resolveGithubToken(req);
    currentUserId = user?.id || null;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or expired. Please login again.",
      });
    }

    if (!githubToken) {
      return res.status(400).json({
        success: false,
        message: "Connect GitHub first to view repository files.",
      });
    }

    const file = await fetchRepositoryFileContent(owner, repo, path, githubToken);

    return res.json({
      success: true,
      message: "Repository file fetched successfully",
      data: file,
    });
  } catch (error: any) {
    if (currentUserId && (error?.response?.status === 401 || error?.response?.status === 403)) {
      await clearUserGithubToken(currentUserId);

      return res.status(400).json({
        success: false,
        message: "GitHub access expired or was revoked. Connect GitHub again.",
      });
    }

    const statusCode = error?.name === "ZodError" ? 400 : 500;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch repository file";

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const reviewSelectedRepositoryFile = async (req: Request, res: Response) => {
  let currentUserId: string | null = null;

  try {
    const { owner, repo, path } = repositoryFileReviewSchema.parse(req.body);
    const { user, githubToken } = await resolveGithubToken(req);
    currentUserId = user?.id || null;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or expired. Please login again.",
      });
    }

    if (!githubToken) {
      return res.status(400).json({
        success: false,
        message: "Connect GitHub first to review repository files.",
      });
    }

    const result = await reviewRepositoryFile(user.id, owner, repo, path, githubToken);
    const metrics = hydrateStoredCodeMetrics({
      lineCount: result.review.lineCount,
      functionCount: result.review.functionCount,
      loopCount: result.review.loopCount,
      nestedLoopDepth: result.review.nestedLoopDepth,
      complexityApproximation: result.review.complexityApproximation,
    });

    return res.json({
      success: true,
      message: "Repository file reviewed successfully",
      data: {
        id: result.review.id,
        sourceType: result.review.sourceType,
        summary: result.review.summary,
        issues: result.review.issues,
        scores: {
          complexity: result.review.complexityScore,
          security: result.review.securityScore,
          overall: result.review.overallScore,
        },
        improvedCode: result.review.improvedCode,
        metrics,
        language: result.review.language,
        originalCode: result.review.originalCode,
        repositoryOwner: result.review.repositoryOwner,
        repositoryName: result.review.repositoryName,
        repositoryFullName: result.review.repositoryFullName,
        filePath: result.review.filePath,
        createdAt: result.review.createdAt,
      },
    });
  } catch (error: any) {
    if (currentUserId && (error?.response?.status === 401 || error?.response?.status === 403)) {
      await clearUserGithubToken(currentUserId);

      return res.status(400).json({
        success: false,
        message: "GitHub access expired or was revoked. Connect GitHub again.",
      });
    }

    const statusCode = error?.name === "ZodError" ? 400 : 500;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to review repository file";

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const debugSelectedRepositoryFile = async (req: Request, res: Response) => {
  let currentUserId: string | null = null;

  try {
    const { owner, repo, path } = repositoryFileReviewSchema.parse(req.body);
    const { user, githubToken } = await resolveGithubToken(req);
    currentUserId = user?.id || null;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or expired. Please login again.",
      });
    }

    if (!githubToken) {
      return res.status(400).json({
        success: false,
        message: "Connect GitHub first to debug repository files.",
      });
    }

    const result = await debugRepositoryFile(owner, repo, path, githubToken);

    return res.json({
      success: true,
      message: "Repository file debug generated successfully",
      data: {
        sourceType: "repository",
        language: result.file.language,
        originalCode: result.file.content,
        repositoryOwner: owner,
        repositoryName: repo,
        repositoryFullName: `${owner}/${repo}`,
        filePath: path,
        ...result.debug,
      },
    });
  } catch (error: any) {
    if (currentUserId && (error?.response?.status === 401 || error?.response?.status === 403)) {
      await clearUserGithubToken(currentUserId);

      return res.status(400).json({
        success: false,
        message: "GitHub access expired or was revoked. Connect GitHub again.",
      });
    }

    const statusCode = error?.name === "ZodError" ? 400 : 500;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to debug repository file";

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
