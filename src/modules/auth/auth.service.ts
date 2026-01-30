import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, UserRole } from "../../models/user.model";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/apiError";

export type JwtPayload = { userId: string; role: UserRole };

const environment = process.env.NODE_ENV ?? "development";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN as any) || "1h";

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function registerUser(input: {
  email: string;
  password: string;
  role?: UserRole;
}) {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new ConflictError("Email already in use");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    email: input.email,
    passwordHash,
    ...(input.role && {
      role:
        environment !== "development" && input.role === "admin"
          ? "user"
          : input.role,
    }),
  });

  const token = signToken({ userId: user._id.toString(), role: user.role });

  return {
    user: { id: user._id.toString(), email: user.email, role: user.role },
    token,
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await User.findOne({ email: input.email });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });

  return {
    user: { id: user._id.toString(), email: user.email, role: user.role },
    token,
  };
}

export async function getMe(userId: string) {
  const user = await User.findById(userId).select(
    "_id email role createdAt updatedAt",
  );
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return { id: user._id.toString(), email: user.email, role: user.role };
}
