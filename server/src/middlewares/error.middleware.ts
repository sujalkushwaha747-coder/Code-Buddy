import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Unhandled server error:", error);

  const statusCode = typeof error?.statusCode === "number" ? error.statusCode : 500;
  const message =
    statusCode >= 500 ? "Internal server error" : error?.message || "Request failed";

  res.status(statusCode).json({
    success: false,
    message,
    requestId: (req as any).requestId,
  });
};
