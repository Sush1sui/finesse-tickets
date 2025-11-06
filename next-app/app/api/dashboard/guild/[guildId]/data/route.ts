import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;

    // Forward request to bot server
    const botResponse = await fetch(
      `http://localhost:3002/api/guilds/${guildId}/data`,
      {
        method: "GET",
        headers: {
          "X-API-Key": process.env.BOT_API_KEY || "",
        },
      }
    );

    if (!botResponse.ok) {
      const errorText = await botResponse.text();
      console.error("Bot API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch guild data" },
        { status: botResponse.status }
      );
    }

    const data = await botResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in guild data API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
