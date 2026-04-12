import { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  message: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const stores = new Map<string, RateLimitEntry>();

const buildClientKey = (req: Request) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const forwardedIp =
    typeof forwardedFor === "string" ? forwardedFor.split(",")[0]?.trim() : undefined;

  return forwardedIp || req.ip || "unknown";
};

export const createRateLimiter = ({
  windowMs,
  maxRequests,
  message,
}: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${req.baseUrl || req.path}:${buildClientKey(req)}`;
    const existing = stores.get(key);

    if (!existing || existing.resetAt <= now) {
      stores.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (existing.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds.toString());
      return res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfterSeconds,
        requestId: (req as any).requestId,
      });
    }

    existing.count += 1;
    stores.set(key, existing);
    return next();
  };
};
