import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import Server from "@/models/Server";
import dbConnect from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;

    // User already verified by accessing dashboard, skip additional Discord API call
    await dbConnect();

    // Fetch server configuration
    const server = await Server.findOne({ serverId: guildId });
    if (!server) {
      return NextResponse.json({
        users: [],
        roles: [],
      });
    }

    return NextResponse.json({
      users: server.ticketConfig?.staffs?.users || [],
      roles: server.ticketConfig?.staffs?.roles || [],
    });
  } catch (error) {
    console.error("Error fetching staff config:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff configuration" },
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { guildId } = await params;

    // User already verified by accessing dashboard, skip additional Discord API call
    const body = await request.json();
    const { users, roles } = body;

    // Validate input
    if (!Array.isArray(users) || !Array.isArray(roles)) {
      return NextResponse.json(
        { error: "Invalid input: users and roles must be arrays" },
        { status: 400 }
      );
    }

    // Validate that all items are strings
    if (
      !users.every((u) => typeof u === "string") ||
      !roles.every((r) => typeof r === "string")
    ) {
      return NextResponse.json(
        { error: "Invalid input: all user and role IDs must be strings" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update server configuration
    const server = await Server.findOneAndUpdate(
      { serverId: guildId },
      {
        $set: {
          "ticketConfig.staffs.users": users,
          "ticketConfig.staffs.roles": roles,
        },
      },
      { new: true, upsert: true }
    );

    if (!server) {
      return NextResponse.json(
        { error: "Failed to update staff configuration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users: server.ticketConfig?.staffs?.users || [],
      roles: server.ticketConfig?.staffs?.roles || [],
    });
  } catch (error) {
    console.error("Error updating staff config:", error);
    return NextResponse.json(
      { error: "Failed to update staff configuration" },
      { status: 500 }
    );
  }
}
