import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schemas";
import { registerUser, loginUser, getMe } from "./auth.service";

export async function register(req: Request, res: Response) {
  const body = registerSchema.parse(req.body);
  const result = await registerUser(body);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const body = loginSchema.parse(req.body);
  const result = await loginUser(body);
  res.status(200).json(result);
}

export async function me(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const result = await getMe(userId);
  res.status(200).json({ user: result });
}
