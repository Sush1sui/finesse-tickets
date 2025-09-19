import { Request, Response, NextFunction } from "express";
import User from "../model/User";

export const oauthCallback = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // req.user is set by passport on successful auth
    // TODO: run your findOrCreate / session augmentation here if needed
    const redirectTo = process.env.FRONTEND_URL || "/";
    return res.redirect(redirectTo);
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req: Request, res: Response) => {
  const cookieName = "connect.sid";
  const frontend = process.env.FRONTEND_URL || "/";
  const wantsJson =
    (req.headers.accept && req.headers.accept.includes("application/json")) ||
    (req.xhr as boolean);

  try {
    const currentUser = (req as any).user;
    // Remove provider tokens for this user/session
    if (currentUser?._id) {
      try {
        await User.updateOne(
          { _id: currentUser._id },
          { $unset: { accessToken: "", refreshToken: "" } }
        );
        console.log("Cleared provider tokens for user:", currentUser._id);
      } catch (e) {
        console.warn("Failed to clear provider tokens:", e);
      }
    }

    // passport logout + session destroy
    await new Promise<void>((resolve, reject) => {
      (req as any).logout((err: any) => (err ? reject(err) : resolve()));
    });

    if (req.session) {
      await new Promise<void>((resolve, reject) =>
        req.session.destroy((err: any) => (err ? reject(err) : resolve()))
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
  const isAuth =
    typeof (req as any).isAuthenticated === "function" &&
    (req as any).isAuthenticated();
  if (!isAuth) {
    console.log("Not authenticated");
    return res.status(401).json({ user: null });
  }
  return res.json({ status: "ok", user: (req as any).user });
};
