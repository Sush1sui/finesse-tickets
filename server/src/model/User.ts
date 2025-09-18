import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  discordId: string;
  username: string;
  avatar: string | undefined;
  accessToken: string;
  refreshToken: string;
}

const UserSchema: Schema = new Schema(
  {
    discordId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    avatar: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
