import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    // User already verified by accessing dashboard, skip additional Discord API call

    // Fetch members from bot server
    const botServerUrl = process.env.BOT_SERVER_URL || "http://localhost:8080";
    const response = await fetch(
      `${botServerUrl}/api/guilds/${guildId}/members`,
      {
        headers: {
          "X-API-Key": process.env.BOT_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bot server error:", errorText);
      throw new Error("Failed to fetch guild members");
    }

    const data = await response.json();
    return NextResponse.json(data.members || []);
  } catch (error) {
    console.error("Error fetching guild members:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
