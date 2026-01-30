import { Schema, model, Document, Types } from "mongoose";

export type KycStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export interface IKycDocument {
  type: "ID_CARD" | "PASSPORT" | "DRIVERS_LICENSE" | "UTILITY_BILL" | "SELFIE";
  url: string; // meta-data only
}

export const KycStatusEnum = [
  "ID_CARD",
  "PASSPORT",
  "DRIVERS_LICENSE",
  "UTILITY_BILL",
  "SELFIE",
];

export interface IKycFields {
  fullName?: string;
  dob?: string; //date string in ISO Format
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
  bvn?: string;
}

export interface IKycSubmission extends Document {
  userId: Types.ObjectId;
  fields: IKycFields;
  documents: IKycDocument[];
  status: KycStatus;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const KycDocSchema = new Schema<IKycDocument>(
  {
    type: {
      type: String,
      enum: KycStatusEnum,
      required: true,
    },
    url: { type: String, required: true },
  },
  { _id: false },
);

const KycSubmissionSchema = new Schema<IKycSubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    fields: { type: Object, default: {} },
    documents: { type: [KycDocSchema], default: [] },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"],
      default: "DRAFT",
    },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },
  },
  { timestamps: true },
);

export const KycSubmission = model<IKycSubmission>(
  "KycSubmission",
  KycSubmissionSchema,
);
