import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Panel from "@/models/Panel";
import { verifyGuildAccess } from "@/lib/discord";
import { genId } from "@/lib/utils";

type Question = { id?: string; prompt: string };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; panelId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { guildId, panelId } = await params;

    // Verify guild access
    const { hasAccess, error, status } = await verifyGuildAccess(
      session.user.id,
      guildId,
    );

    if (!hasAccess) {
      return NextResponse.json({ error }, { status: status || 403 });
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
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; panelId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { guildId, panelId } = await params;
    const body = await request.json();

    // Verify guild access
    const { hasAccess, error, status } = await verifyGuildAccess(
      session.user.id,
      guildId,
    );

    if (!hasAccess) {
      return NextResponse.json({ error }, { status: status || 403 });
    }

    // Sanitize and normalize update payload
    const updateBody: Record<string, unknown> = { ...body };
    delete updateBody.serverId;
    delete updateBody._id;

    // Normalize flattened questions into nested schema shape for update
    if (
      typeof body.askQuestions !== "undefined" ||
      Array.isArray(body.questions)
    ) {
      const arr = Array.isArray(body.questions)
        ? body.questions
        : body.questions && Array.isArray(body.questions.questions)
          ? body.questions.questions
          : [];

      if (arr.length > 5) {
        return NextResponse.json(
          { error: "Max 5 questions allowed" },
          { status: 400 },
        );
      }
      if (
        arr.some(
          (q: Question | undefined) =>
            !q || typeof q.prompt !== "string" || !q.prompt.trim(),
        )
      ) {
        return NextResponse.json(
          { error: "Question prompts cannot be blank" },
          { status: 400 },
        );
      }

      updateBody.questions = {
        askQuestions: Boolean(body.askQuestions) || arr.length > 0,
        questions: arr.map((q: Question) => ({
          id: q.id ?? genId(),
          prompt: q.prompt,
        })),
      };
    }

    // If welcomeEmbed provided, ensure nested fields are set properly
    if (body.welcomeEmbed) {
      updateBody.welcomeEmbed = {
        ...((await Panel.findById(panelId))?.welcomeEmbed || {}),
        ...body.welcomeEmbed,
      };
    }

    // Update panel
    const panel = await Panel.findOneAndUpdate(
      { _id: panelId, serverId: guildId },
      { $set: updateBody },
      { new: true },
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
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; panelId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { guildId, panelId } = await params;

    // Verify guild access
    const { hasAccess, error, status } = await verifyGuildAccess(
      session.user.id,
      guildId,
    );

    if (!hasAccess) {
      return NextResponse.json({ error }, { status: status || 403 });
    }

    // Find panel first to get message details
    const panel = await Panel.findOne({
      _id: panelId,
      serverId: guildId,
    });

    if (!panel) {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }

    // Delete all Discord messages for this panel
    if (panel.messageIds && panel.messageIds.length > 0) {
      const botServerUrl =
        process.env.BOT_SERVER_URL || "http://localhost:8080";

      // Delete all messages in parallel
      await Promise.allSettled(
        panel.messageIds.map(({ channelId, messageId }) =>
          fetch(`${botServerUrl}/api/delete-message`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.BOT_API_KEY}`,
            },
            body: JSON.stringify({ channelId, messageId }),
          }).catch((error) => {
            console.error(`Error deleting message ${messageId}:`, error);
          }),
        ),
      );
    }

    // Delete panel from database
    await Panel.findByIdAndDelete(panelId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting panel:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
