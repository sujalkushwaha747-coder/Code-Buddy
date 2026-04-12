import { NextFunction, Request, Response } from "express";

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value.replace(/\u0000/g, "").replace(/\r\n/g, "\n");
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
        key,
        sanitizeValue(nestedValue),
      ]),
    );
  }

  return value;
};

export const sanitizeRequest = (req: Request, _res: Response, next: NextFunction) => {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query) as Request["query"];
  req.params = sanitizeValue(req.params) as Request["params"];
  next();
};
