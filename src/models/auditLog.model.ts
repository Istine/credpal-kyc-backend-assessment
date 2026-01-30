import { Schema, model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  requestId?: string;
  actorId?: Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: Types.ObjectId;
  meta: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    requestId: { type: String, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const AuditLog = model<IAuditLog>("AuditLog", AuditLogSchema);
