import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Panel from "@/models/Panel";
import { verifyGuildAccess } from "@/lib/discord";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; panelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { guildId, panelId } = await params;

    // Verify guild access
    const { hasAccess, error, status } = await verifyGuildAccess(
      session.user.id,
      guildId
    );

    if (!hasAccess) {
      return NextResponse.json({ error }, { status: status || 403 });
    }

    // Fetch panel
    const panel = await Panel.findOne({ _id: panelId, serverId: guildId });

    if (!panel) {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }

    return NextResponse.json({ panel });
  } catch (error) {
    console.error("Error fetching panel:", error);
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
  { params }: { params: Promise<{ guildId: string; panelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { guildId, panelId } = await params;
    const body = await request.json();

    // Verify guild access
    const { hasAccess, error, status } = await verifyGuildAccess(
      session.user.id,
      guildId
    );

    if (!hasAccess) {
      return NextResponse.json({ error }, { status: status || 403 });
    }

    // Update panel
    const panel = await Panel.findOneAndUpdate(
      { _id: panelId, serverId: guildId },
      { $set: body },
      { new: true }
    );

    if (!panel) {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, panel });
  } catch (error) {
    console.error("Error updating panel:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; panelId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { guildId, panelId } = await params;

    // Verify guild access
    const { hasAccess, error, status } = await verifyGuildAccess(
      session.user.id,
      guildId
    );

    if (!hasAccess) {
      return NextResponse.json({ error }, { status: status || 403 });
    }

    // Delete panel
    const panel = await Panel.findOneAndDelete({
      _id: panelId,
      serverId: guildId,
    });

    if (!panel) {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting panel:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
