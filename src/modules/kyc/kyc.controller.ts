import { Request, Response } from "express";
import { kycPatchSchema } from "./kyc.schemas";
import { getMyKyc, upsertMyKyc, submitMyKyc, deleteMyKyc } from "./kyc.service";

export async function getMeKyc(req: Request, res: Response) {
  const userId = req.user?.id as string;
  const sub = await getMyKyc(userId);
  res.json({ kyc: sub ?? null });
}

export async function patchMeKyc(req: Request, res: Response) {
  const userId = req.user?.id as string;
  const body = kycPatchSchema.parse(req.body);
  console.log(body);

  const sub = await upsertMyKyc(userId, body);
  res.json({ kyc: sub });
}

export async function submitMeKyc(req: Request, res: Response) {
  const userId = req.user?.id as string;
  const requestId = req.requestId as string | undefined;
  const sub = await submitMyKyc(userId, requestId);
  res.json({ kyc: sub });
}

export async function deleteMeKyc(req: Request, res: Response) {
  const userId = req.user?.id as string;

  const requestId = req.requestId as string | undefined;

  const result = await deleteMyKyc(userId, requestId);
  res.status(200).json(result);
}
