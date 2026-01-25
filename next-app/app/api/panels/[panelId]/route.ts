import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Panel from "@/models/Panel";
import { verifyGuildAccess } from "@/lib/discord";

type Question = { id?: string; prompt: string };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ panelId: string }> },
) {
  try {
    await dbConnect();

    const { panelId } = await params;
    const panel = await Panel.findById(panelId);
    if (!panel) {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }

    // Return complete panel data (normalized)
    return NextResponse.json({
      panel: {
        _id: String(panel._id),
        guild: panel.serverId,
        channel: panel.channel,
        title: panel.title,
        content: panel.content ?? null,
        color: panel.color,
        largeImgUrl: panel.largeImgUrl ?? null,
        smallImgUrl: panel.smallImgUrl ?? null,
        btnText: panel.btnText,
        btnColor: panel.btnColor,
        btnEmoji: panel.btnEmoji ?? null,
        mentionOnOpen: panel.mentionOnOpen || [],
        ticketCategory: panel.ticketCategory ?? null,
        askQuestions: panel.questions?.askQuestions ?? false,
        questions: (panel.questions?.questions || []).map((q: Question) => ({
          id: q.id,
          prompt: q.prompt,
        })),
        welcomeEmbed: panel.welcomeEmbed,
      },
    });
  } catch (error) {
    console.error("Error fetching panel:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch panel",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ panelId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { panelId } = await params;
    const body = await req.json();

    // Find existing panel to get serverId
    const existing = await Panel.findById(panelId);
    if (!existing) {
      return NextResponse.json({ error: "Panel not found" }, { status: 404 });
    }

    // Verify user has access to the guild that owns this panel
    const { hasAccess, error, status } = await verifyGuildAccess(
      session.user.id,
      existing.serverId,
    );

    if (!hasAccess) {
      return NextResponse.json({ error }, { status: status || 403 });
    }

    // Sanitize body: prevent changing serverId or _id
    const update = { ...body };
    delete update.serverId;
    delete update._id;

    // Normalize questions payload into nested DB shape, validate, and set welcomeEmbed
    if (body) {
      if (Array.isArray(body.questions) && body.questions.length > 5) {
        return NextResponse.json(
          { error: "Max 5 questions allowed" },
          { status: 400 },
        );
      }
      if (
        body.questions &&
        Array.isArray(body.questions.questions) &&
        body.questions.questions.length > 5
      ) {
        return NextResponse.json(
          { error: "Max 5 questions allowed" },
          { status: 400 },
        );
      }

      // Convert flattened array -> nested { askQuestions, questions } shape
      if (Array.isArray(body.questions)) {
        update.questions = {
          askQuestions:
            typeof body.askQuestions === "boolean"
              ? body.askQuestions
              : (existing.questions?.askQuestions ?? false),
          questions: body.questions.map((q: Question) => ({
            id: q.id,
            prompt: q.prompt,
          })),
        };
      } else if (body.questions && Array.isArray(body.questions.questions)) {
        update.questions = {
          askQuestions:
            typeof body.questions.askQuestions === "boolean"
              ? body.questions.askQuestions
              : (existing.questions?.askQuestions ?? false),
          questions: body.questions.questions.map((q: Question) => ({
            id: q.id,
            prompt: q.prompt,
          })),
        };
      } else if (typeof body.askQuestions === "boolean") {
        update.questions = {
          ...(existing.questions || { askQuestions: false, questions: [] }),
          askQuestions: body.askQuestions,
        };
      }

      const flattened = Array.isArray(body.questions)
        ? body.questions
        : body.questions && Array.isArray(body.questions.questions)
          ? body.questions.questions
          : [];

      if (
        flattened.some(
          (q: Question | undefined) =>
            !q || typeof q.prompt !== "string" || !q.prompt.trim(),
        )
      ) {
        return NextResponse.json(
          { error: "Question prompts cannot be blank" },
          { status: 400 },
        );
      }
    }

    // If welcomeEmbed provided, ensure nested fields are set properly
    if (body.welcomeEmbed) {
      update.welcomeEmbed = {
        ...existing.welcomeEmbed,
        ...body.welcomeEmbed,
      };
    }

    const panel = await Panel.findByIdAndUpdate(
      panelId,
      { $set: update },
      { new: true },
    );

    if (!panel) {
      return NextResponse.json(
        { error: "Failed to update panel" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      panel: {
        _id: String(panel._id),
        guild: panel.serverId,
        channel: panel.channel,
        title: panel.title,
        content: panel.content ?? null,
        color: panel.color,
        largeImgUrl: panel.largeImgUrl ?? null,
        smallImgUrl: panel.smallImgUrl ?? null,
        btnText: panel.btnText,
        btnColor: panel.btnColor,
        btnEmoji: panel.btnEmoji ?? null,
        mentionOnOpen: panel.mentionOnOpen || [],
        ticketCategory: panel.ticketCategory ?? null,
        askQuestions: panel.questions?.askQuestions ?? false,
        questions: (panel.questions?.questions || []).map((q: Question) => ({
          id: q.id,
          prompt: q.prompt,
        })),
        welcomeEmbed: panel.welcomeEmbed,
      },
    });
  } catch (err) {
    console.error("Error updating panel:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
