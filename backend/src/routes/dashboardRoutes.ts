import { Router } from "express";
import { getAdminServers } from "../controllers/dashboardController";

const router = Router();

router.get("/admin-servers", getAdminServers);

export default router;
