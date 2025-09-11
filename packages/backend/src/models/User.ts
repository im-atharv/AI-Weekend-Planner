import { Schema, model } from "mongoose";
import type { User as SharedUser } from "../../../shared/types.js";

// Extend the shared User type for persistence fields
interface UserDocument extends SharedUser {
  passwordHash?: string;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export default model<UserDocument>("User", UserSchema);
