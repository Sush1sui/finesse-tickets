import { Request, Response } from "express";
import User from "../model/User";
import { AuthRequest } from "../types/auth";

const DISCORD_API = "https://discord.com/api/v10";
const BOT_SERVER_URL = process.env.BOT_SERVER_URL || "http://localhost:3002";
// permission bits
const PERM_ADMIN = BigInt(1) << BigInt(3);
const PERM_KICK = BigInt(1) << BigInt(1);
const PERM_BAN = BigInt(1) << BigInt(2);
const PERM_MANAGE_CHANNELS = BigInt(1) << BigInt(4);
const PERM_MANAGE_MESSAGES = BigInt(1) << BigInt(13);
const PERM_MODERATE = BigInt(1) << BigInt(40); // MODERATE_MEMBERS (timeout)
const PERM_VIEW_AUDIT = BigInt(1) << BigInt(7);

const MODERATOR_MASK =
  PERM_MANAGE_CHANNELS |
  PERM_MANAGE_MESSAGES |
  PERM_KICK |
  PERM_BAN |
  PERM_MODERATE |
  PERM_VIEW_AUDIT |
  PERM_ADMIN;

export async function GetPermittedDiscordServersHandler(
  req: Request,
  res: Response
) {
  const authReq = req as AuthRequest;
  const user = authReq.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  // fetch the saved user OAuth token
  const dbUser = await User.findById(user._id)
    .select("accessToken")
    .lean<{ accessToken?: string }>();
  const token = dbUser?.accessToken;
  if (!token) {
    return res
      .status(403)
      .json({ error: "No Discord token; please re-authenticate" });
  }

  const apiRes = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!apiRes.ok) {
    const text = await apiRes.text().catch(() => "");
    console.error("Failed to fetch Discord guilds:", apiRes.status, text);
    return res.status(502).json({ error: "Discord API error", details: text });
  }

  const guilds = (await apiRes.json()) as Array<{
    id: string;
    name: string;
    icon?: string | null;
    owner?: boolean;
    permissions?: string;
  }>;

  // filter guilds where user is owner OR permissions include required bits
  const permitted = guilds.filter((g) => {
    if (g.owner) return true;
    const perms = BigInt(g.permissions ?? "0");
    return (perms & MODERATOR_MASK) !== BigInt(0);
  });

  // Ask bot server which of those guilds the bot is actually in (efficient)
  try {
    const r = await fetch(`${BOT_SERVER_URL}/api/servers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.BOT_API_KEY,
      },
      body: JSON.stringify({ guildIds: permitted.map((g) => g.id) }),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.warn("Bot server presence check failed:", r.status, txt);
      // graceful fallback: return permitted (best-effort) instead of erroring
      return res.status(502).json({
        error: "Bot presence check failed",
        status: r.status,
        details: txt,
      });
    }

    const body = (await r.json()) as {
      servers?: { id: string; name: string; icon: string }[];
    };
    const presentServers = new Set(body.servers?.map((s) => s.id) ?? []);
    const permittedWhereBotIsIn = permitted.filter((g) =>
      presentServers.has(g.id)
    );
    return res.status(200).json({ permittedServers: permittedWhereBotIsIn });
  } catch (err) {
    console.error("Bot presence check error:", err);
    return res
      .status(502)
      .json({ error: "Bot presence check error", details: err });
  }
}
