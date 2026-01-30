import { Request, Response } from "express";
import { adminReviewSchema } from "../kyc/kyc.schemas";
import { adminGetKyc, adminListKyc, adminReviewKyc } from "./admin.kyc.service";

export async function listKyc(req: Request, res: Response) {
  const { status, page, limit, search } = req.query;

  const result = await adminListKyc({
    status: typeof status === "string" ? status : undefined,
    page: typeof page === "string" ? Number(page) : 1,
    limit: typeof limit === "string" ? Number(limit) : 20,
    search: typeof search === "string" ? search : undefined,
  });

  res.json(result);
}

export async function getKyc(req: Request, res: Response) {
  const sub = await adminGetKyc(req.params.id as string);
  res.json({ kyc: sub });
}

export async function reviewKyc(req: Request, res: Response) {
  const body = adminReviewSchema.parse(req.body);

  const reviewerId = (req as any).user.id as string;
  const requestId = (req as any).requestId as string | undefined;

  const sub = await adminReviewKyc({
    submissionId: req.params.id as string,
    reviewerId,
    decision: body.decision,
    reason: body.reason,
    requestId,
  });

  res.json({ kyc: sub });
}
