import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { decryptText, encryptText } from "@/lib/encryption";

const DISCORD_API = "https://discord.com/api/v10";
const BOT_SERVER_URL = process.env.BOT_SERVER_URL || "http://localhost:3002";

// Permission bits
const PERM_ADMIN = BigInt(1) << BigInt(3);
const PERM_KICK = BigInt(1) << BigInt(1);
const PERM_BAN = BigInt(1) << BigInt(2);
const PERM_MANAGE_CHANNELS = BigInt(1) << BigInt(4);
const PERM_MANAGE_MESSAGES = BigInt(1) << BigInt(13);
const PERM_MODERATE = BigInt(1) << BigInt(40);
const PERM_VIEW_AUDIT = BigInt(1) << BigInt(7);

const MODERATOR_MASK =
  PERM_MANAGE_CHANNELS |
  PERM_MANAGE_MESSAGES |
  PERM_KICK |
  PERM_BAN |
  PERM_MODERATE |
  PERM_VIEW_AUDIT |
  PERM_ADMIN;

export async function GET() {
  const { error, user } = await requireAuth();
  if (error) {
    console.log("[permitted-servers] Auth failed");
    return error;
  }

  console.log("[permitted-servers] Authenticated user:", user.id);

  try {
    await dbConnect();
  } catch (dbError) {
    console.error("[permitted-servers] Database connection failed:", dbError);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 503 }
    );
  }

  try {
    // Fetch user's Discord access token
    const dbUser = await User.findById(user.id).select("accessToken").lean();

    let token: string | undefined;
    if (dbUser?.accessToken) {
      try {
        token = decryptText(dbUser.accessToken);
      } catch (e) {
        // Token not encrypted (old format), migrate it
        console.warn("Access token not encrypted; migrating for user", user.id);
        console.error("Error during decryption:", e);
        token = dbUser.accessToken;
        // Migrate in background
        User.updateOne(
          { _id: user.id },
          { $set: { accessToken: encryptText(token) } }
        )
          .exec()
          .catch((err) => console.warn("Failed to migrate token:", err));
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "No Discord token; please re-authenticate" },
        { status: 403 }
      );
    }

    // Fetch user's guilds from Discord
    const apiRes = await fetch(`${DISCORD_API}/users/@me/guilds`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!apiRes.ok) {
      const text = await apiRes.text().catch(() => "");
      console.error("Failed to fetch Discord guilds:", apiRes.status, text);
      return NextResponse.json(
        { error: "Discord API error", details: text },
        { status: 502 }
      );
    }

    const guilds = (await apiRes.json()) as Array<{
      id: string;
      name: string;
      icon?: string | null;
      owner?: boolean;
      permissions?: string;
    }>;

    // Filter guilds where user is owner OR has moderator permissions
    const permitted = guilds.filter((g) => {
      if (g.owner) return true;
      const perms = BigInt(g.permissions ?? "0");
      return (perms & MODERATOR_MASK) !== BigInt(0);
    });

    // Check which guilds the bot is in
    try {
      const botRes = await fetch(`${BOT_SERVER_URL}/api/servers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.BOT_API_KEY || "",
        },
        body: JSON.stringify({ guildIds: permitted.map((g) => g.id) }),
      });

      if (!botRes.ok) {
        const txt = await botRes.text().catch(() => "");
        console.warn("Bot server presence check failed:", botRes.status, txt);
        return NextResponse.json(
          {
            error: "Bot presence check failed",
            status: botRes.status,
            details: txt,
          },
          { status: 502 }
        );
      }

      const body = (await botRes.json()) as {
        servers?: { id: string; name: string; icon: string }[];
      };

      const presentServers = new Set(body.servers?.map((s) => s.id) ?? []);
      const permittedWhereBotIsIn = permitted.filter((g) =>
        presentServers.has(g.id)
      );

      return NextResponse.json({ permittedServers: permittedWhereBotIsIn });
    } catch (err) {
      console.error("Bot presence check error:", err);
      return NextResponse.json(
        { error: "Bot presence check error", details: String(err) },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Error in permitted-servers route:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
