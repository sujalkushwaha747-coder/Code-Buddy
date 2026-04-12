import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

export const attachRequestId = (req: Request, res: Response, next: NextFunction) => {
  const existingRequestId = req.headers["x-request-id"];
  const requestId =
    typeof existingRequestId === "string" && existingRequestId.trim()
      ? existingRequestId
      : randomUUID();

  (req as any).requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
};
