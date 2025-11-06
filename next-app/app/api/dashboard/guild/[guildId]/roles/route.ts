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

    // Forward request to bot server
    const botServerUrl = `http://localhost:3002/api/guilds/${guildId}/roles`;
    const response = await fetch(botServerUrl, {
      headers: {
        "X-API-Key": process.env.BOT_API_KEY || "",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch roles" },
        { status: response.status }
      );
    }

    const roles = await response.json();
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
