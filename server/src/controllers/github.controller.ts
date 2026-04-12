import { Request, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import {
  clearUserGithubToken,
  resolveAuthenticatedUser,
} from "../services/user.service";

const frontendDashboardUrl = "http://localhost:5173/dashboard";

const redirectWithFrontendStatus = (
  res: Response,
  params: Record<string, string>,
) => {
  const hash = new URLSearchParams(params).toString();
  return res.redirect(`${frontendDashboardUrl}#${hash}`);
};

export const githubLogin = (req: Request, res: Response) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "JWT token missing in query",
    });
  }

  const url =
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&scope=repo,user&allow_signup=true&prompt=select_account&state=${encodeURIComponent(String(token))}`;

  return res.redirect(url);
};

export const githubCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string | undefined;
    const jwtToken = req.query.state as string | undefined;

    if (!code) {
      return redirectWithFrontendStatus(res, {
        github_error: "No authorization code received from GitHub",
      });
    }

    if (!jwtToken) {
      return redirectWithFrontendStatus(res, {
        github_error: "GitHub login session is missing. Please try again.",
      });
    }

    const decoded = jwt.verify(
      jwtToken,
      process.env.JWT_SECRET as string,
    ) as {
      id?: string;
      userId?: string;
    };

    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return redirectWithFrontendStatus(res, {
        github_error: "Authenticated user could not be identified.",
      });
    }

    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    const accessToken = tokenRes.data.access_token as string | undefined;

    if (!accessToken) {
      const providerError =
        tokenRes.data?.error_description ||
        tokenRes.data?.error ||
        "Failed to get GitHub access token";

      return redirectWithFrontendStatus(res, {
        github_error: providerError,
      });
    }

    const githubProfileResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    const githubLogin = githubProfileResponse.data?.login as string | undefined;

    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          githubToken: accessToken,
        },
      });
    } catch (dbError) {
      console.warn("GitHub token could not be saved to DB, using frontend fallback:", dbError);
    }

    return redirectWithFrontendStatus(res, {
      github_token: accessToken,
      github_status: "connected",
      ...(githubLogin ? { github_user: githubLogin } : {}),
    });
  } catch (error: any) {
    const providerMessage =
      error?.response?.data?.error_description ||
      error?.response?.data?.error ||
      error?.message ||
      "GitHub OAuth failed";

    console.error("GitHub OAuth error:", error?.response?.data || error);

    return redirectWithFrontendStatus(res, {
      github_error: providerMessage,
    });
  }
};

export const getGithubRepos = async (req: Request, res: Response) => {
  let authenticatedUser = null as Awaited<ReturnType<typeof resolveAuthenticatedUser>> | null;

  try {
    authenticatedUser = await resolveAuthenticatedUser(
      (req as any).user || (req as any).auth,
    );

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        error: "Your session is invalid or expired. Please login again.",
      });
    }

    const githubToken = authenticatedUser.githubToken;

    if (!githubToken) {
      return res.status(400).json({
        success: false,
        error: "GitHub token not found. Please login with GitHub first.",
      });
    }

    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    return res.json(response.data);
  } catch (error: any) {
    if (
      authenticatedUser?.id &&
      (error?.response?.status === 401 || error?.response?.status === 403)
    ) {
      await clearUserGithubToken(authenticatedUser.id);

      return res.status(400).json({
        success: false,
        error: "GitHub access expired or was revoked. Connect GitHub again.",
      });
    }

    console.error("Repo fetch error:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch GitHub repositories",
    });
  }
};

export const disconnectGithub = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = await resolveAuthenticatedUser(
      (req as any).user || (req as any).auth,
    );

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or expired. Please login again.",
      });
    }

    await clearUserGithubToken(authenticatedUser.id);

    return res.json({
      success: true,
      message: "GitHub account disconnected successfully.",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to disconnect GitHub account.",
    });
  }
};
