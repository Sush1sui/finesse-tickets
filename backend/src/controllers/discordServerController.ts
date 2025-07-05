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
      const newServer = await DiscordServer.create({
        guildId: serverId,
        name:
          adminServers.find((server) => server.id === serverId)?.name ||
          "Unknown Server",
        icon:
          adminServers.find((server) => server.id === serverId)?.icon ||
          undefined,
        maxTicketsPerUser: 5,
        ticketNameStyle: "number",
        autoCloseTicket: {
          enabled: false,
          closeWhenUserLeaves: false,
          sinceOpenWithNoResponse: 0,
          sinceLastMessageWithNoResponse: 0,
        },
      });
      res.status(201).json({
        status: "success",
        message: "Server created successfully",
        data: newServer,
      });
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

export async function updateServer(req: Request, res: Response) {
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

    const adminServers = collectAdminServers(userId);
    const isAdmin = adminServers.some((server) => server.id === serverId);

    if (!isAdmin) {
      res
        .status(403)
        .json({ error: "You do not have permission to access this server" });
      return;
    }

    const updatedServer = await DiscordServer.findOneAndUpdate(
      { guildId: serverId },
      req.body,
      { new: true }
    );

    if (!updatedServer) {
      res.status(404).json({ error: "Server not found" });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Server updated successfully",
      data: updatedServer,
    });
    return;
  } catch (error) {
    console.error("Error updating server:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}
