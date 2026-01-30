import { Schema, model, Document } from "mongoose";

export type UserRole = "user" | "admin" | "support";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "support"],
      default: "user",
      required: true,
    },
  },
  { timestamps: true },
);

UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const { passwordHash, ...rest } = ret;
    return rest;
  },
});

export const User = model<IUser>("User", UserSchema);
