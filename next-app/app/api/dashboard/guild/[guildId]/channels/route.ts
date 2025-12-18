import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

const BOT_API_URL = process.env.BOT_API_URL || "http://localhost:3002";
const BOT_API_KEY = process.env.BOT_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;

    // Fetch channels from bot server
    const response = await fetch(
      `${BOT_API_URL}/api/guilds/${guildId}/channels`,
      {
        headers: {
          "X-API-Key": BOT_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch channels from bot" },
        { status: response.status }
      );
    }

    const channels = await response.json();
    return NextResponse.json(channels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
