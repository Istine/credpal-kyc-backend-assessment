import { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/user.model";
import { ForbiddenError } from "../utils/apiError";

export function requireRole(...roles: Array<UserRole>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role as string | undefined;
    if (!role || !roles.includes(role as UserRole)) {
      const err = new ForbiddenError();
      return next(err);
    }
    next();
  };
}
