export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    options?: {
      code?: string;
      details?: unknown;
    },
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = options?.code;
    this.details = options?.details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad request", details?: unknown) {
    super(400, message, { code: "BAD_REQUEST", details });
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, message, { code: "UNAUTHORIZED" });
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, message, { code: "FORBIDDEN" });
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found") {
    super(404, message, { code: "NOT_FOUND" });
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(409, message, { code: "CONFLICT" });
  }
}

export class InternalServerError extends ApiError {
  constructor(message = "Internal server error") {
    super(500, message, { code: "INTERNAL_ERROR" });
  }
}
