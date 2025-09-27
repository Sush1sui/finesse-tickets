import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";

export default function RequireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authReq = req as AuthRequest;
  if (!authReq.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}
