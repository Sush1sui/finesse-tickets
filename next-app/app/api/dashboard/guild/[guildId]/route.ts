import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Server from "@/models/Server";
import { verifyGuildAccess } from "@/lib/discord";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { guildId } = await params;

    // Verify guild access with automatic token refresh
    const { hasAccess, guild, error, status } = await verifyGuildAccess(
      session.user.id,
      guildId
    );

    if (!hasAccess) {
      return NextResponse.json({ error }, { status: status || 403 });
    }

    // Find or create server in database
    let server = await Server.findOne({ serverId: guildId });

    if (!server) {
      // Create new server with default config
      server = await Server.create({
        serverId: guildId,
        name: guild!.name,
        icon: guild!.icon,
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
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await dbConnect();
    } catch (dbError) {
      console.error("[500 Server Error] Database connection failed:", dbError);
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    const { guildId } = await params;
    const body = await request.json();

    // Verify guild access with automatic token refresh
    const { hasAccess, error, status } = await verifyGuildAccess(
      session.user.id,
      guildId
    );

    if (!hasAccess) {
      return NextResponse.json({ error }, { status: status || 403 });
    }

    // Find server and update
    const server = await Server.findOne({ serverId: guildId });
    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Ensure multiPanels has default values if not set (for existing servers)
    if (!server.ticketConfig.multiPanels.messageEmbedConfig.title) {
      server.ticketConfig.multiPanels.messageEmbedConfig.title =
        "Select a Panel";
    }
    if (!server.ticketConfig.multiPanels.messageEmbedConfig.description) {
      server.ticketConfig.multiPanels.messageEmbedConfig.description =
        "Choose a panel to open a ticket";
    }

    // Update ticket config with proper nested object merging
    if (body.ticketConfig) {
      // Merge each nested object properly
      server.ticketConfig.ticketNameStyle =
        body.ticketConfig.ticketNameStyle ??
        server.ticketConfig.ticketNameStyle;

      // Handle ticketTranscript separately - allow empty string/null to clear the value
      if ("ticketTranscript" in body.ticketConfig) {
        server.ticketConfig.ticketTranscript =
          body.ticketConfig.ticketTranscript || null;
      }

      server.ticketConfig.maxTicketsPerUser =
        body.ticketConfig.maxTicketsPerUser ??
        server.ticketConfig.maxTicketsPerUser;

      if (body.ticketConfig.ticketPermissions) {
        server.ticketConfig.ticketPermissions = {
          ...server.ticketConfig.ticketPermissions,
          ...body.ticketConfig.ticketPermissions,
        };
      }

      if (body.ticketConfig.autoClose) {
        server.ticketConfig.autoClose = {
          ...server.ticketConfig.autoClose,
          ...body.ticketConfig.autoClose,
          sinceOpenWithoutResponse: {
            ...server.ticketConfig.autoClose.sinceOpenWithoutResponse,
            ...(body.ticketConfig.autoClose.sinceOpenWithoutResponse || {}),
          },
          sinceLastResponse: {
            ...server.ticketConfig.autoClose.sinceLastResponse,
            ...(body.ticketConfig.autoClose.sinceLastResponse || {}),
          },
        };
      }
    }

    await server.save();

    // Build the full Discord CDN icon URL
    const iconUrl = server.icon
      ? `https://cdn.discordapp.com/icons/${server.serverId}/${server.icon}.${
          server.icon.startsWith("a_") ? "gif" : "png"
        }?size=128`
      : null;

    return NextResponse.json({
      success: true,
      server: {
        serverId: server.serverId,
        name: server.name,
        icon: iconUrl,
        ticketConfig: server.ticketConfig,
      },
    });
  } catch (error) {
    console.error("Error updating guild settings:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
