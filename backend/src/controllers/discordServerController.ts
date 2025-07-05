import { Request, Response } from "express";
import DiscordServer from "../models/DiscordServer";
import { collectAdminServers } from "./dashboardController";

export async function getServer(req: Request, res: Response) {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "User not authenticated",
      });
      return;
    }

    const userId = req.user.discordId;
    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    const serverId = req.params.serverId;
    if (!serverId) {
      res.status(400).json({ error: "Server ID is required" });
      return;
    }

    const serverFromDB = await DiscordServer.findOne({ guildId: serverId });

    const adminServers = collectAdminServers(userId);

    const isAdmin = adminServers.some((server) => server.id === serverId);

    if (!isAdmin) {
      res
        .status(403)
        .json({ error: "You do not have permission to access this server" });
      return;
    }

    if (!serverFromDB) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Server fetched successfully",
      data: serverFromDB,
    });
  } catch (error) {
    console.error("Error fetching server:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}
