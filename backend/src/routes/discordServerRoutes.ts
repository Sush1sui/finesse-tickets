import { Router } from "express";
import {
  getServer,
  updateServer,
} from "../controllers/discordServerController";

const discordServerRoutes = Router();

discordServerRoutes.get("/:serverId", getServer);
discordServerRoutes.put("/:serverId", updateServer);

export default discordServerRoutes;
