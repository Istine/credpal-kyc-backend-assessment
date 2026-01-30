import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError";
import logger from "../config/logger";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      code: "VALIDATION_ERROR",
      details: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
      requestId: req.requestId,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      details: err.details,
      requestId: req.requestId,
    });
  }

  logger.error("Unhandled error:", err);

  return res.status(500).json({
    message: "Internal server error",
    code: "INTERNAL_ERROR",
    requestId: req.requestId,
  });
}
