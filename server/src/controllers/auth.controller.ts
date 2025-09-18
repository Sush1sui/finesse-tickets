import { Request, Response, NextFunction } from "express";

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

export const logout = (req: Request, res: Response, next: NextFunction) => {
  // using any to avoid TS issues with passport augmentations on Request
  (req as any).logout((err: any) => {
    if (err) return next(err);
    req.session?.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect(process.env.FRONTEND_URL || "/");
    });
  });
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
