import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Panel from "@/models/Panel";

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

    // Return panel data needed for ticket creation
    return NextResponse.json({
      panelId: String(panel._id),
      serverId: panel.serverId,
      mentionOnOpen: panel.mentionOnOpen || [],
      ticketCategory: panel.ticketCategory,
      welcomeEmbed: panel.welcomeEmbed,
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
