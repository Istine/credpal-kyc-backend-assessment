import mongoose from "mongoose";
import { KycSubmission } from "../../models/kycSubmission.model";
import { AuditLog } from "../../models/auditLog.model";
import { BadRequestError, NotFoundError } from "../../utils/apiError";

function canEdit(status: string) {
  return status === "DRAFT" || status === "REJECTED";
}

function minimalKycValidationForSubmit(sub: any) {
  const f = sub.fields || {};
  if (!f.fullName || !f.dob || !f.addressLine1) return false;
  if (!Array.isArray(sub.documents) || sub.documents.length === 0) return false;
  return true;
}

export async function getMyKyc(userId: string) {
  if (!userId) throw new BadRequestError();
  return KycSubmission.findOne({ userId });
}

export async function upsertMyKyc(
  userId: string,
  patch: { fields?: any; documents?: any[] },
) {
  const existing = await KycSubmission.findOne({ userId });

  if (!existing) {
    const created = await KycSubmission.create({
      userId,
      fields: patch.fields ?? {},
      documents: patch.documents ?? [],
      status: "DRAFT",
    });
    return created;
  }

  if (!canEdit(existing.status)) {
    throw new BadRequestError(
      `KYC cannot be edited in status ${existing.status}`,
    );
  }

  if (patch.fields)
    existing.fields = { ...(existing.fields || {}), ...patch.fields };
  if (patch.documents) existing.documents = patch.documents;

  await existing.save();
  return existing;
}

export async function submitMyKyc(userId: string, requestId?: string) {
  const session = await mongoose.startSession();

  try {
    let updated: any;

    await session.withTransaction(async () => {
      const sub = await KycSubmission.findOne({ userId }).session(session);
      if (!sub) throw new NotFoundError("KYC submission not found");

      if (sub.status !== "DRAFT" && sub.status !== "REJECTED") {
        throw new BadRequestError(
          `Only DRAFT/REJECTED can be submitted (current: ${sub.status})`,
        );
      }

      if (!minimalKycValidationForSubmit(sub)) {
        throw new BadRequestError(
          "KYC is incomplete. Provide required fields and at least one document.",
        );
      }

      sub.status = "SUBMITTED";
      sub.submittedAt = new Date();
      sub.rejectionReason = undefined;
      sub.reviewedAt = undefined;
      sub.reviewedBy = undefined;

      updated = await sub.save({ session });

      await AuditLog.create(
        [
          {
            requestId,
            actorId: sub.userId,
            action: "KYC_SUBMITTED",
            entityType: "KycSubmission",
            entityId: sub._id,
            meta: { status: "SUBMITTED" },
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

function canDelete(status: string) {
  return status === "DRAFT" || status === "REJECTED";
}

export async function deleteMyKyc(userId: string, requestId?: string) {
  const sub = await KycSubmission.findOne({ userId });

  if (!sub) {
    throw new NotFoundError("KYC submission not found");
  }

  if (!canDelete(sub.status)) {
    throw new BadRequestError(`KYC cannot be deleted in status ${sub.status}`);
  }

  await KycSubmission.deleteOne({ _id: sub._id });

  await AuditLog.create({
    requestId,
    actorId: sub.userId,
    action: "KYC_DELETED",
    entityType: "KycSubmission",
    entityId: sub._id,
    meta: { previousStatus: sub.status },
  });

  return { deleted: true };
}
