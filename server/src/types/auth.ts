import type { Request } from "express";
import type { Types } from "mongoose";

export type SessionUser = {
  _id: Types.ObjectId | string;
  username?: string;
  avatar?: string;
};

export type AuthRequest = Request & {
  user?: SessionUser;
  logout?: (cb?: (err?: unknown) => void) => void;
  isAuthenticated?: () => boolean;
};
