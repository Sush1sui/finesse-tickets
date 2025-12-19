import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Panel from "@/models/Panel";
import { verifyGuildAccess } from "@/lib/discord";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ panelId: string }> }
) {
  try {
    await dbConnect();

    const { panelId } = await params;
    const panel = await Panel.findById(panelId);
    if (!panel) {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }

    // Return complete panel data
    return NextResponse.json({
      panel: {
        _id: String(panel._id),
        guild: panel.guild,
        channel: panel.channel,
        title: panel.title,
        content: panel.content,
        color: panel.color,
        largeImgUrl: panel.largeImgUrl,
        smallImgUrl: panel.smallImgUrl,
        btnText: panel.btnText,
        btnColor: panel.btnColor,
        btnEmoji: panel.btnEmoji,
        mentionOnOpen: panel.mentionOnOpen || [],
        ticketCategory: panel.ticketCategory,
        welcomeEmbed: panel.welcomeEmbed,
      },
    });
  } catch (error) {
    console.error("Error fetching panel:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch panel",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ panelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { panelId } = await params;
    const body = await req.json();

    // Find existing panel to get serverId
    const existing = await Panel.findById(panelId);
    if (!existing) {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }

    // Verify user has access to the guild that owns this panel
    const { hasAccess, error, status } = await verifyGuildAccess(
      session.user.id,
      existing.serverId
    );

    if (!hasAccess) {
      return NextResponse.json({ error }, { status: status || 403 });
    }

    // Sanitize body: prevent changing serverId or _id
    const update = { ...body } as any;
    delete update.serverId;
    delete update._id;

    // If welcomeEmbed provided, ensure nested fields are set properly
    if (body.welcomeEmbed) {
      update.welcomeEmbed = {
        ...existing.welcomeEmbed,
        ...body.welcomeEmbed,
      };
    }

    const panel = await Panel.findByIdAndUpdate(
      panelId,
      { $set: update },
      { new: true }
    );

    if (!panel) {
      return NextResponse.json(
        { error: "Failed to update panel" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, panel });
  } catch (err) {
    console.error("Error updating panel:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
