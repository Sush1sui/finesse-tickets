import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Server from "@/models/Server";
import User from "@/models/User";
import { decryptText } from "@/lib/encryption";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { guildId } = await params;

    // Check if user has access to this guild
    // session.user.id is the MongoDB _id, we need to find by _id
    const user = await User.findById(session.user.id);
    if (!user) {
      console.error("User not found with id:", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.accessToken) {
      return NextResponse.json(
        { error: "No access token available" },
        { status: 401 }
      );
    }

    // Decrypt the access token
    let decryptedToken: string;
    try {
      decryptedToken = decryptText(user.accessToken);
    } catch (decryptError) {
      console.error("Token decryption error:", decryptError);
      return NextResponse.json(
        { error: "Failed to decrypt access token" },
        { status: 500 }
      );
    }

    // Fetch user's guilds from Discord to verify access
    const discordResponse = await fetch(
      "https://discord.com/api/users/@me/guilds",
      {
        headers: {
          Authorization: `Bearer ${decryptedToken}`,
        },
      }
    );

    if (!discordResponse.ok) {
      console.error(
        "Discord API error:",
        discordResponse.status,
        await discordResponse.text()
      );
      return NextResponse.json(
        { error: "Failed to fetch guilds from Discord" },
        { status: 500 }
      );
    }

    const guilds = await discordResponse.json();
    const guild = guilds.find(
      (g: { id: string; name: string; icon: string | null }) => g.id === guildId
    );

    if (!guild) {
      return NextResponse.json(
        { error: "You don't have access to this guild" },
        { status: 403 }
      );
    }

    // Find or create server in database
    let server = await Server.findOne({ serverId: guildId });

    if (!server) {
      // Create new server with default config
      server = await Server.create({
        serverId: guildId,
        name: guild.name,
        icon: guild.icon,
        ticketConfig: {
          ticketNameStyle: "num",
          ticketTranscript: null,
          maxTicketsPerUser: 1,
          ticketPermissions: {
            attachments: false,
            links: false,
            reactions: false,
          },
          autoClose: {
            enabled: false,
            closeWhenUserLeaves: false,
            sinceOpenWithoutResponse: {
              Days: 0,
              Hours: 0,
              Minutes: 0,
            },
            sinceLastResponse: {
              Days: 0,
              Hours: 0,
              Minutes: 0,
            },
          },
          multiPanels: {
            channel: null,
            panels: [],
            dropdownConfig: {
              use: false,
              placeholder: null,
            },
            messageEmbedConfig: {
              color: "#000000",
              description: null,
              authorName: null,
              authorUrl: null,
              authorImgUrl: null,
              largeImgUrl: null,
              smallImgUrl: null,
              footerText: null,
              footerImgUrl: null,
            },
          },
          staffs: {
            users: [],
            roles: [],
          },
        },
      });
    }

    // Build the full Discord CDN icon URL
    const iconUrl = server.icon
      ? `https://cdn.discordapp.com/icons/${server.serverId}/${server.icon}.${
          server.icon.startsWith("a_") ? "gif" : "png"
        }?size=128`
      : null;

    return NextResponse.json({
      serverId: server.serverId,
      name: server.name,
      icon: iconUrl,
      ticketConfig: server.ticketConfig,
    });
  } catch (error) {
    console.error("Error fetching guild:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
