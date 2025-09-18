import { Router } from "express";
import passport from "passport";
import * as authCtrl from "../controllers/auth.controller";

const authRouter = Router();

// start oauth (redirect to Discord)
authRouter.get(
  "/discord",
  passport.authenticate("discord", { scope: ["identify", "email", "guilds"] })
);

// callback: passport middleware then controller handles success
authRouter.get(
  "/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/auth/discord" }),
  authCtrl.oauthCallback
);

authRouter.get("/logout", authCtrl.logout);
authRouter.get("/me", authCtrl.me);

export default authRouter;
