import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Panel from "@/models/Panel";
import { verifyGuildAccess } from "@/lib/discord";

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

    // Verify guild access with automatic token refresh
    const { hasAccess, error, status } = await verifyGuildAccess(
      session.user.id,
      guildId
    );

    if (!hasAccess) {
      return NextResponse.json({ error }, { status: status || 403 });
    }

    // Fetch panels for this guild
    const panels = await Panel.find({ serverId: guildId }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ panels });
  } catch (error) {
    console.error("Error fetching panels:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const body = await request.json();

    // Verify guild access with automatic token refresh
    const { hasAccess, error, status } = await verifyGuildAccess(
      session.user.id,
      guildId
    );

    if (!hasAccess) {
      return NextResponse.json({ error }, { status: status || 403 });
    }

    // Create new panel
    const panel = await Panel.create({
      serverId: guildId,
      ...body,
    });

    return NextResponse.json({ success: true, panel });
  } catch (error) {
    console.error("Error creating panel:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
