import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Panel from "@/models/Panel";
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

    // Verify user has access to this guild
    const user = await User.findById(session.user.id);
    if (!user || !user.accessToken) {
      return NextResponse.json(
        { error: "User not found or no access token" },
        { status: 404 }
      );
    }

    // Decrypt and verify guild access
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
