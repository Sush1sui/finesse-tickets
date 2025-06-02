import { Request, Response } from "express";
import { client } from "../bot";

export const getAdminServers = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "User not authenticated",
      });
      return;
    }

    const userId = req.user.discordId;

    const adminServers = client.guilds.cache
      .filter((guild) => {
        // Condition 1: Is the user the owner of the guild?
        if (guild.ownerId === userId) {
          return true;
        }

        // For other checks, the user must be a member of the guild.
        const member = guild.members.cache.get(userId);
        if (!member) {
          // If not the owner and not a member, they can't have admin rights here.
          return false;
        }

        // Condition 2: Does the member have direct "Administrator" permission?
        if (member.permissions.has("Administrator")) {
          return true;
        }

        // Condition 3: Does the member have a role with "Administrator" permission?
        if (
          member.roles.cache.some((role) =>
            role.permissions.has("Administrator")
          )
        ) {
          return true;
        }

        return false; // Not owner, no direct admin permission, no role with admin permission
      })
      .map((guild) => {
        const member = guild.members.cache.get(userId); // Member should exist due to filter logic
        const isAdminPermission = member
          ? member.permissions.has("Administrator")
          : false;
        const isOwner = guild.ownerId === userId;

        // Determine if admin by role (simplified)
        const isAdminByRole = member
          ? member.roles.cache.some((role) =>
              role.permissions.has("Administrator")
            )
          : false;

        return {
          id: guild.id,
          name: guild.name,
          icon: guild.iconURL(),
          owner: isOwner,
          isAdmin: isAdminPermission || isAdminByRole, // Combine direct and role-based admin status
        };
      });

    res.status(200).json({
      status: "success",
      message: "Admin servers fetched successfully",
      data: adminServers,
    });
    return;
  } catch (error) {
    console.error("Error fetching admin servers:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch admin servers",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return;
  }
};
