import { Request, Response, NextFunction } from "express";
import User from "../model/User";
import { AuthRequest } from "../types/auth";

export const oauthCallback = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const redirectTo = process.env.FRONTEND_URL || "/";
    return res.redirect(redirectTo);
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cookieName = "connect.sid";
  const frontend = process.env.FRONTEND_URL || "/";
  const wantsJson =
    (req.headers.accept && req.headers.accept.includes("application/json")) ||
    (req.xhr as boolean);

  try {
    const currentUser = authReq.user;
    // Remove provider tokens for this user/session
    if (currentUser && currentUser._id) {
      try {
        await User.updateOne(
          { _id: currentUser._id },
          { $unset: { accessToken: "", refreshToken: "" } }
        );
      } catch (e) {
        console.warn("Failed to clear provider tokens:", e);
      }
    }

    // passport logout (callback form) if available
    if (typeof authReq.logout === "function") {
      await new Promise<void>((resolve, reject) =>
        authReq.logout!((err?: unknown) => (err ? reject(err) : resolve()))
      );
    }

    // destroy session if present
    if (req.session) {
      await new Promise<void>((resolve, reject) =>
        req.session!.destroy((err: Error | null) =>
          err ? reject(err) : resolve()
        )
      );
    }

    res.clearCookie(cookieName, { path: "/" });

    if (wantsJson) return res.status(200).json({ message: "Logged out" });
    return res.redirect(frontend);
  } catch (err) {
    console.error("Logout error:", err);
    if (!res.headersSent)
      return res.status(500).json({ error: "Logout failed" });
  }
};

export const me = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const isAuth =
    typeof authReq.isAuthenticated === "function" &&
    authReq.isAuthenticated?.();
  if (!isAuth) {
    console.log("Not authenticated");
    return res.status(401).json({ user: null });
  }
  return res.json({ status: "ok", user: authReq.user });
};
