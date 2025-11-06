import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Panel from "@/models/Panel";
import User from "@/models/User";
import { decryptText } from "@/lib/encryption";

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

    // Verify user has access
    const user = await User.findById(session.user.id);
    if (!user || !user.accessToken) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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

    const discordResponse = await fetch(
      "https://discord.com/api/users/@me/guilds",
      {
        headers: {
          Authorization: `Bearer ${decryptedToken}`,
        },
      }
    );

    if (!discordResponse.ok) {
      return NextResponse.json(
        { error: "Failed to verify guild access" },
        { status: 500 }
      );
    }

    const guilds = await discordResponse.json();
    const hasAccess = guilds.find(
      (g: { id: string; name: string; icon: string | null }) => g.id === guildId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this guild" },
        { status: 403 }
      );
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

    // Verify user has access
    const user = await User.findById(session.user.id);
    if (!user || !user.accessToken) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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

    const discordResponse = await fetch(
      "https://discord.com/api/users/@me/guilds",
      {
        headers: {
          Authorization: `Bearer ${decryptedToken}`,
        },
      }
    );

    if (!discordResponse.ok) {
      return NextResponse.json(
        { error: "Failed to verify guild access" },
        { status: 500 }
      );
    }

    const guilds = await discordResponse.json();
    const hasAccess = guilds.find(
      (g: { id: string; name: string; icon: string | null }) => g.id === guildId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this guild" },
        { status: 403 }
      );
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

    // Verify user has access
    const user = await User.findById(session.user.id);
    if (!user || !user.accessToken) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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

    const discordResponse = await fetch(
      "https://discord.com/api/users/@me/guilds",
      {
        headers: {
          Authorization: `Bearer ${decryptedToken}`,
        },
      }
    );

    if (!discordResponse.ok) {
      return NextResponse.json(
        { error: "Failed to verify guild access" },
        { status: 500 }
      );
    }

    const guilds = await discordResponse.json();
    const hasAccess = guilds.find(
      (g: { id: string; name: string; icon: string | null }) => g.id === guildId
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this guild" },
        { status: 403 }
      );
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
