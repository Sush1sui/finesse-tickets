import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Server from "@/models/Server";
import { verifyGuildAccess } from "@/lib/discord";

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

    const body = await req.json();

    // Update server with multi-panel config
    const server = await Server.findOneAndUpdate(
      { serverId: guildId },
      {
        $set: {
          "ticketConfig.multiPanels": {
            channel: body.channel,
            panels: body.selectedPanels.filter((id: string) => id),
            dropdownConfig: {
              use: body.useDropdown,
              placeholder: body.dropdownPlaceholder || null,
            },
            messageEmbedConfig: {
              color: body.embedColor,
              title: body.title || null,
              description: body.description || null,
              authorName: body.authorName || null,
              authorUrl: body.authorUrl || null,
              authorImgUrl: body.authorIconUrl || null,
              largeImgUrl: body.largeImgUrl || null,
              smallImgUrl: body.smallImgUrl || null,
              footerText: body.footerText || null,
              footerImgUrl: body.footerImgUrl || null,
            },
          },
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, server });
  } catch (error) {
    console.error("Error creating multi-panel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;

    await dbConnect();

    // Check if server exists in database (means user has access)
    const server = await Server.findOne({ serverId: guildId });

    if (!server) {
      return NextResponse.json({ error: "Guild not found" }, { status: 404 });
    }

    // Return multi-panel config or null
    const multiPanel = server.ticketConfig?.multiPanels || null;

    return NextResponse.json({ multiPanel });
  } catch (error) {
    console.error("Error fetching multi-panel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Clear multi-panel config
    await Server.findOneAndUpdate(
      { serverId: guildId },
      {
        $set: {
          "ticketConfig.multiPanels": {
            channel: null,
            panels: [],
            dropdownConfig: {
              use: false,
              placeholder: null,
            },
            messageEmbedConfig: {
              color: "#5865F2",
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
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting multi-panel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
