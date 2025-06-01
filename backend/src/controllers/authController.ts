import { Request, Response, NextFunction } from "express";
import passport from "../config/passport";

export const discordLogin = passport.authenticate("discord");

export const discordCallback = passport.authenticate("discord", {
  failureRedirect: process.env.FRONTEND_URL || "/", // Or your frontend failure route
  successRedirect: process.env.FRONTEND_URL || "/", // Or your frontend success route
});

export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destruction error:", destroyErr);
        return next(destroyErr);
      }
      res.clearCookie("connect.sid"); // Clear the session cookie
      // Redirect to frontend or send a success message
      res.redirect(process.env.FRONTEND_URL || "/");
    });
  });
};

export const getAuthStatus = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.status(200).json({
      status: "success",
      message: "User is authenticated",
      user: req.user,
    });
  } else {
    res.status(401).json({
      status: "error",
      message: "User is not authenticated",
    });
  }
};
