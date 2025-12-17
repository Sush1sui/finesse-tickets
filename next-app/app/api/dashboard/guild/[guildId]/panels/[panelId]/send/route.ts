import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Panel from "@/models/Panel";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string; panelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { guildId, panelId } = await params;

    const panel = await Panel.findById(panelId);
    if (!panel) {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }

    if (panel.serverId !== guildId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Send request to bot server to send the panel
    const botServerUrl = process.env.BOT_SERVER_URL || "http://localhost:8080";
    const response = await fetch(`${botServerUrl}/send-panel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BOT_API_SECRET}`,
      },
      body: JSON.stringify({
        panelId: String(panel._id),
        serverId: panel.serverId,
        channelId: panel.channel,
        title: panel.title,
        content: panel.content,
        color: panel.color,
        btnColor: panel.btnColor,
        btnText: panel.btnText,
        btnEmoji: panel.btnEmoji,
        largeImgUrl: panel.largeImgUrl,
        smallImgUrl: panel.smallImgUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Bot server error: ${error}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Error sending panel:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send panel",
      },
      { status: 500 }
    );
  }
}
