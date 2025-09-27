import { Router } from "express";
import RequireAuth from "../middleware/auth";
import * as dashboardCtrl from "../controllers/dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get(
  "/permitted-servers",
  RequireAuth,
  dashboardCtrl.GetPermittedDiscordServersHandler
);

export default dashboardRouter;
