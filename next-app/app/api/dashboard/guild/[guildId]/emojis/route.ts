import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;

    // Proxy request to bot server
    const botServerUrl = process.env.BOT_SERVER_URL || "http://localhost:3002";
    const botApiKey = process.env.BOT_API_KEY || "";

    const response = await fetch(
      `${botServerUrl}/api/guilds/${guildId}/emojis`,
      {
        headers: {
          "X-API-Key": botApiKey,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch emojis from bot" },
        { status: response.status }
      );
    }

    const emojis = await response.json();
    return NextResponse.json(emojis);
  } catch (error) {
    console.error("Error fetching emojis:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
