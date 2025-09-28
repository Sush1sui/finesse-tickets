import { Request, Response, NextFunction } from "express";
import User from "../model/User";
import { AuthRequest } from "../types/auth";

export const oauthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authReq = req as AuthRequest;

    // regenerate session to prevent fixation
    if (req.session) {
      await new Promise<void>((resolve, reject) =>
        req.session!.regenerate((err) => (err ? reject(err) : resolve()))
      );
    }

    // re-establish passport login in the new session
    if (authReq.user) {
      await new Promise<void>((resolve, reject) =>
        req.logIn(authReq.user!, (err) => (err ? reject(err) : resolve()))
      );
    }

    // optional: persist tokens if set on req.user/profile (ensure your passport strategy sets them)
    // Example: if profile tokens were attached to req.user by passport, save them on User doc
    try {
      const current = authReq.user;
      if (current && current.accessToken && current.refreshToken) {
        await User.updateOne(
          { _id: current._id },
          {
            $set: {
              accessToken: current.accessToken,
              refreshToken: current.refreshToken,
            },
          }
        ).exec();
      }
    } catch (e) {
      console.warn("Failed to persist discord tokens:", e);
    }

    const redirectTo = process.env.FRONTEND_URL || "/";
    return res.redirect(redirectTo);
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cookieName = process.env.SESSION_NAME || "connect.sid";
  const frontend = process.env.FRONTEND_URL || "/";

  try {
    // attempt passport logout
    if (typeof authReq.logout === "function") {
      await new Promise<void>((resolve, reject) =>
        authReq.logout!((err) => (err ? reject(err) : resolve()))
      );
    }

    // destroy session server-side
    if (req.session) {
      await new Promise<void>((resolve, reject) =>
        req.session!.destroy((err) => (err ? reject(err) : resolve()))
      );
    }

    // clear cookie
    res.clearCookie(cookieName, { path: "/" });

    // redirect or JSON
    const wantsJson =
      (req.headers.accept && req.headers.accept.includes("application/json")) ||
      (req.xhr as boolean);
    if (wantsJson) return res.status(200).json({ message: "Logged out" });
    return res.redirect(frontend);
  } catch (err) {
    console.error("Logout error:", err);
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
