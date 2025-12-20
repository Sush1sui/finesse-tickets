import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Server from "@/models/Server";
import Panel from "@/models/Panel";
import { verifyGuildAccess } from "@/lib/discord";

const BOT_SERVER_URL = process.env.BOT_SERVER_URL || "http://localhost:8080";
const BOT_API_KEY = process.env.BOT_API_KEY;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;

    // Verify guild access
    const { hasAccess, error, status } = await verifyGuildAccess(
      session.user.id,
      guildId
    );

    if (!hasAccess) {
      return NextResponse.json({ error }, { status: status || 403 });
    }

    await dbConnect();

    // Get server with multi-panel config
    const server = await Server.findOne({ serverId: guildId });

    if (!server || !server.ticketConfig?.multiPanels) {
      return NextResponse.json(
        { error: "Multi-panel not configured" },
        { status: 404 }
      );
    }

    const multiPanel = server.ticketConfig.multiPanels;

    if (!multiPanel.channel || multiPanel.panels.length < 2) {
      return NextResponse.json(
        { error: "Invalid multi-panel configuration" },
        { status: 400 }
      );
    }

    // Fetch all panels
    const panels = await Panel.find({
      _id: { $in: multiPanel.panels },
    }).lean();

    if (panels.length < 2) {
      return NextResponse.json(
        { error: "Not enough valid panels found" },
        { status: 400 }
      );
    }

    // Prepare panel data for bot
    const panelData = panels.map((panel) => ({
      id: String(panel._id),
      title: panel.title,
      btnText: panel.btnText,
      btnColor: panel.btnColor,
      btnEmoji: panel.btnEmoji,
    }));

    // Send to bot
    const botResponse = await fetch(`${BOT_SERVER_URL}/api/send-multi-panel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BOT_API_KEY}`,
      },
      body: JSON.stringify({
        guildId,
        channelId: multiPanel.channel,
        panels: panelData,
        useDropdown: multiPanel.dropdownConfig.use,
        dropdownPlaceholder:
          multiPanel.dropdownConfig.placeholder || "Select a panel...",
        embed: {
          color: multiPanel.messageEmbedConfig.color,
          title: multiPanel.messageEmbedConfig.title,
          description: multiPanel.messageEmbedConfig.description,
          author: multiPanel.messageEmbedConfig.authorName
            ? {
                name: multiPanel.messageEmbedConfig.authorName,
                url: multiPanel.messageEmbedConfig.authorUrl,
                iconURL: multiPanel.messageEmbedConfig.authorImgUrl,
              }
            : undefined,
          image: multiPanel.messageEmbedConfig.largeImgUrl
            ? { url: multiPanel.messageEmbedConfig.largeImgUrl }
            : undefined,
          thumbnail: multiPanel.messageEmbedConfig.smallImgUrl
            ? { url: multiPanel.messageEmbedConfig.smallImgUrl }
            : undefined,
          footer: multiPanel.messageEmbedConfig.footerText
            ? {
                text: multiPanel.messageEmbedConfig.footerText,
                iconURL: multiPanel.messageEmbedConfig.footerImgUrl,
              }
            : undefined,
        },
      }),
    });

    if (!botResponse.ok) {
      const errorText = await botResponse.text();
      console.error("Bot error:", errorText);
      return NextResponse.json(
        { error: "Failed to send multi-panel to Discord" },
        { status: 500 }
      );
    }

    const result = await botResponse.json();

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Error sending multi-panel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
