import mongoose from "mongoose";
import { KycSubmission } from "../../models/kycSubmission.model";
import { AuditLog } from "../../models/auditLog.model";
import { BadRequestError, NotFoundError } from "../../utils/apiError";

export async function adminListKyc(params: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const skip = (page - 1) * limit;

  const query: any = {};
  if (params.status) query.status = params.status;

  // lightweight search: userId not helpful; if you want search by name, search fields.fullName
  if (params.search)
    query["fields.fullName"] = { $regex: params.search, $options: "i" };

  const [items, total] = await Promise.all([
    KycSubmission.find(query)
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    KycSubmission.countDocuments(query),
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function adminGetKyc(id: string) {
  const sub = await KycSubmission.findById(id);
  if (!sub) throw new NotFoundError("KYC submission not found");
  return sub;
}

export async function adminReviewKyc(input: {
  submissionId: string;
  reviewerId: string;
  decision: "APPROVED" | "REJECTED";
  reason?: string;
  requestId?: string;
}) {
  const session = await mongoose.startSession();

  try {
    let updated: any;

    await session.withTransaction(async () => {
      const sub = await KycSubmission.findById(input.submissionId).session(
        session,
      );
      if (!sub) throw new NotFoundError("KYC submission not found");

      if (sub.status !== "SUBMITTED" && sub.status !== "UNDER_REVIEW") {
        throw new BadRequestError(
          `Only SUBMITTED/UNDER_REVIEW can be reviewed (current: ${sub.status})`,
        );
      }

      if (input.decision === "REJECTED" && !input.reason) {
        throw new BadRequestError("Reason is required when rejecting");
      }

      sub.status = input.decision;
      sub.reviewedAt = new Date();
      sub.reviewedBy = new mongoose.Types.ObjectId(input.reviewerId);
      sub.rejectionReason =
        input.decision === "REJECTED" ? input.reason : undefined;

      updated = await sub.save({ session });

      await AuditLog.create(
        [
          {
            requestId: input.requestId,
            actorId: new mongoose.Types.ObjectId(input.reviewerId),
            action: "KYC_REVIEWED",
            entityType: "KycSubmission",
            entityId: sub._id,
            meta: { decision: input.decision, reason: input.reason ?? null },
          },
        ],
        { session },
      );
    });

    return updated;
  } finally {
    session.endSession();
  }
}
