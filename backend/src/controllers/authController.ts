import { Request, Response } from "express";
import passport from "../config/passport";

export const discordLogin = passport.authenticate("discord");

export const discordCallback = passport.authenticate("discord", {
  failureRedirect: process.env.FRONTEND_URL || "/", // Or your frontend failure route
  successRedirect: process.env.FRONTEND_URL || "/", // Or your frontend success route
});

export const logout = (req: Request, res: Response) => {
  const cookieName = "connect.sid"; // Default session cookie name for express-session
  const cookieOptions: Record<string, any> = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/", // Explicitly set path, usually defaults to this
    // domain: process.env.COOKIE_DOMAIN, // If you specified a domain when setting the cookie
  };

  req.logout((logoutErr) => {
    if (logoutErr) {
      console.error("Error during req.logout:", logoutErr);
      // Note: Even if req.logout fails, we proceed to destroy the session and clear the cookie
      // as a best-effort cleanup. The final response will reflect this error if subsequent steps succeed.
    }

    req.session.destroy((destroyErr) => {
      // Always attempt to clear the cookie, regardless of session.destroy outcome
      res.clearCookie(cookieName, cookieOptions);

      if (destroyErr) {
        console.error("Session destruction error:", destroyErr);
        // If session destruction fails, this is a significant issue for logout.
        return res.status(500).json({
          status: "error",
          message: "Logout failed: Could not destroy session.",
        });
      }

      if (logoutErr) {
        // If req.logout initially failed, but session destruction was okay.
        return res.status(500).json({
          status: "error",
          message: "Logout failed: Error during passport logout process.",
        });
      }

      // All steps (or best effort for cleanup) completed successfully.
      return res
        .status(200)
        .json({ status: "success", message: "Logged out successfully." });
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
