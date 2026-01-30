import { z } from "zod";
import { KycStatusEnum } from "../../models/kycSubmission.model";

export const kycPatchSchema = z.object({
  fields: z
    .object({
      fullName: z.string().min(2).optional(),
      dob: z.string().min(8).optional(),
      addressLine1: z.string().min(3).optional(),
      city: z.string().min(2).optional(),
      state: z.string().min(2).optional(),
      country: z.string().min(2).optional(),
      bvn: z.string().min(6).optional(),
    })
    .partial()
    .optional(),

  documents: z
    .array(
      z.object({
        type: z.enum(KycStatusEnum),
        url: z.url(),
      }),
    )
    .optional(),
});

export const adminReviewSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().min(2).optional(),
});
