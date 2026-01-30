import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/apiError";
import { UserRole } from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

type Decoded = {
  userId: string;
  role: UserRole;
  iat: number;
  exp: number;
};

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid Authorization header");
    }

    const token = header.substring("Bearer ".length).trim();
    const decoded = jwt.verify(token, JWT_SECRET) as Decoded;

    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (e: any) {
    const err = new UnauthorizedError("Unauthorized");
    next(err);
  }
}
