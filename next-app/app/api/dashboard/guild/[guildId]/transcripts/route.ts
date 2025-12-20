import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Transcript from "@/models/Transcript";

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
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Filters
    const userId = searchParams.get("userId") || "";
    const panelId = searchParams.get("panelId") || "";
    const ticketId = searchParams.get("ticketId") || "";
    const username = searchParams.get("username") || "";

    await dbConnect();

    // Build query
    const query: Record<string, string | { $regex: string; $options: string }> =
      { guildId };

    if (userId) {
      query.userId = userId;
    }
    if (panelId) {
      query.panelId = panelId;
    }
    if (ticketId) {
      query.ticketId = ticketId;
    }
    if (username) {
      query.username = { $regex: username, $options: "i" };
    }

    // Fetch transcripts
    const transcripts = await Transcript.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-messages") // Exclude full messages for list view
      .lean();

    // Get total count for pagination
    const total = await Transcript.countDocuments(query);

    return NextResponse.json({
      transcripts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching transcripts:", error);
    return NextResponse.json(
      { error: "Failed to fetch transcripts" },
      { status: 500 }
    );
  }
}
