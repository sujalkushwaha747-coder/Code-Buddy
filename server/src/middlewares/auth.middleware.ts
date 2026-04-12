import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { verifyAuthToken } from "../config/jwt";

const readBearerToken = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

const attachAuth = (req: Request) => {
  const token = readBearerToken(req);
  if (!token) {
    return false;
  }

  const payload = verifyAuthToken(token);
  (req as any).auth = payload;
  (req as any).user = payload;
  return true;
};

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const attached = attachAuth(req);

    if (!attached) {
      res.status(401).json({
        success: false,
        message: "Authorization header missing or invalid",
        requestId: (req as any).requestId,
      });
      return;
    }

    next();
  } catch (error) {
    const message =
      error instanceof jwt.TokenExpiredError ? "Token expired. Please login again." : "Invalid or expired token";

    res.status(401).json({
      success: false,
      message,
      requestId: (req as any).requestId,
    });
  }
};

export const authenticateIfPresent = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    attachAuth(req);
  } catch (error) {
    (req as any).auth = undefined;
    (req as any).user = undefined;
  }

  next();
};
