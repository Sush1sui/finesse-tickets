import User from "@/models/User";
import { decryptText, encryptText } from "@/lib/encryption";

const DISCORD_API = "https://discord.com/api/v10";

/**
 * Refresh Discord access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const response = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(
        "[discord] Failed to refresh token:",
        response.status,
        errorText
      );
      return null;
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  } catch (error) {
    console.error("[discord] Error refreshing token:", error);
    return null;
  }
}

/**
 * Get user's Discord guilds with automatic token refresh
 */
export async function getUserGuilds(userId: string): Promise<{
  guilds: Array<{ id: string; name: string; icon: string | null }> | null;
  error?: string;
  status?: number;
}> {
  const dbUser = await User.findById(userId)
    .select("accessToken refreshToken")
    .lean();

  if (!dbUser?.accessToken) {
    return { guilds: null, error: "No access token", status: 401 };
  }

  let token: string;
  let refreshToken: string | undefined;

  try {
    token = decryptText(dbUser.accessToken);
  } catch {
    return { guilds: null, error: "Failed to decrypt token", status: 500 };
  }

  if (dbUser.refreshToken) {
    try {
      refreshToken = decryptText(dbUser.refreshToken);
    } catch {
      // Ignore refresh token decrypt error
    }
  }

  // Try fetching guilds
  let response = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // If token expired, try to refresh
  if (response.status === 401 && refreshToken) {
    console.log("[discord] Token expired, attempting refresh...");
    const newTokens = await refreshAccessToken(refreshToken);

    if (newTokens) {
      // Update tokens in database
      await User.updateOne(
        { _id: userId },
        {
          $set: {
            accessToken: encryptText(newTokens.accessToken),
            refreshToken: encryptText(newTokens.refreshToken),
          },
        }
      );

      // Retry with new token
      token = newTokens.accessToken;
      response = await fetch(`${DISCORD_API}/users/@me/guilds`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      return {
        guilds: null,
        error: "Session expired; please re-authenticate",
        status: 401,
      };
    }
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("[discord] Failed to fetch guilds:", response.status, text);
    return {
      guilds: null,
      error: "Failed to fetch guilds from Discord",
      status: 502,
    };
  }

  const guilds = await response.json();
  return { guilds };
}

/**
 * Check if user has access to a specific guild
 */
export async function verifyGuildAccess(
  userId: string,
  guildId: string
): Promise<{
  hasAccess: boolean;
  guild?: { id: string; name: string; icon: string | null };
  error?: string;
  status?: number;
}> {
  const { guilds, error, status } = await getUserGuilds(userId);

  if (!guilds) {
    return { hasAccess: false, error, status };
  }

  const guild = guilds.find((g) => g.id === guildId);
  if (!guild) {
    return {
      hasAccess: false,
      error: "You don't have access to this guild",
      status: 403,
    };
  }

  return { hasAccess: true, guild };
}
