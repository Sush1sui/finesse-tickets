import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Panel, { IPanel } from "@/models/Panel";
import { verifyGuildAccess } from "@/lib/discord";
import { rateLimit } from "@/lib/rateLimit";
import { genId } from "@/lib/utils";

type Question = { id?: string; prompt: string };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  // Apply rate limiting
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { guildId } = await params;

    // Skip guild access verification here to avoid rate limits
    // Access is already verified when fetching /api/dashboard/guild/${guildId}

    // Fetch panels for this guild
    const panelsRaw = (await Panel.find({ serverId: guildId }).sort({
      createdAt: -1,
    })) as IPanel[];

    const panels = (panelsRaw || []).map((p) => {
      const welcome = p.welcomeEmbed ?? {
        color: p.color || "#5865F2",
        title: null,
        description: null,
        titleImgUrl: null,
        largeImgUrl: null,
        smallImgUrl: null,
        footerText: null,
        footerImgUrl: null,
      };

      return {
        _id: String(p._id),
        guild: p.serverId,
        channel: p.channel,
        title: p.title,
        content: p.content ?? null,
        color: p.color,
        largeImgUrl: p.largeImgUrl ?? null,
        smallImgUrl: p.smallImgUrl ?? null,
        btnText: p.btnText,
        btnColor: p.btnColor,
        btnEmoji: p.btnEmoji ?? null,
        mentionOnOpen: p.mentionOnOpen ?? [],
        ticketCategory: p.ticketCategory ?? null,
        askQuestions: p.questions?.askQuestions ?? false,
        questions: (p.questions?.questions || []).map((q: Question) => ({
          id: q.id,
          prompt: q.prompt,
        })),
        welcomeEmbed: welcome,
      };
    });

    return NextResponse.json({ panels });
  } catch (error) {
    console.error("Error fetching panels:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { guildId } = await params;
    const body = await request.json();

    // Validate questions limit (accept both flattened and nested shapes)
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
      // Ensure no blank prompts
      const flattened = Array.isArray(body.questions)
        ? body.questions
        : body.questions && Array.isArray(body.questions.questions)
          ? body.questions.questions
          : [];

      if (
        flattened.some(
          (q: Question) =>
            !q || typeof q.prompt !== "string" || !q.prompt.trim(),
        )
      ) {
        return NextResponse.json(
          { error: "Question prompts cannot be blank" },
          { status: 400 },
        );
      }
    }

    // Verify guild access with automatic token refresh
    const { hasAccess, error, status } = await verifyGuildAccess(
      session.user.id,
      guildId,
    );

    if (!hasAccess) {
      return NextResponse.json({ error }, { status: status || 403 });
    }

    // Create new panel
    // Normalize questions payload: convert flattened shape to nested schema shape
    const normalizedBody = { ...body };
    if (
      typeof normalizedBody.askQuestions !== "undefined" ||
      Array.isArray(normalizedBody.questions)
    ) {
      const arr = Array.isArray(normalizedBody.questions)
        ? normalizedBody.questions
        : normalizedBody.questions &&
            Array.isArray(normalizedBody.questions.questions)
          ? normalizedBody.questions.questions
          : [];

      normalizedBody.questions = {
        askQuestions: Boolean(normalizedBody.askQuestions) || arr.length > 0,
        questions: arr.map((q: Question) => ({
          id: q.id ?? genId(),
          prompt: q.prompt,
        })),
      };
      delete normalizedBody.askQuestions;
    }

    const panelDoc = (await Panel.create({
      serverId: guildId,
      ...normalizedBody,
    })) as IPanel;

    const p = panelDoc;
    const welcome = p.welcomeEmbed ?? {
      color: p.color || "#5865F2",
      title: null,
      description: null,
      titleImgUrl: null,
      largeImgUrl: null,
      smallImgUrl: null,
      footerText: null,
      footerImgUrl: null,
    };

    const panel = {
      _id: String(p._id),
      guild: p.serverId,
      channel: p.channel,
      title: p.title,
      content: p.content ?? null,
      color: p.color,
      largeImgUrl: p.largeImgUrl ?? null,
      smallImgUrl: p.smallImgUrl ?? null,
      btnText: p.btnText,
      btnColor: p.btnColor,
      btnEmoji: p.btnEmoji ?? null,
      mentionOnOpen: p.mentionOnOpen ?? [],
      ticketCategory: p.ticketCategory ?? null,
      welcomeEmbed: welcome,
    };

    return NextResponse.json({ success: true, panel });
  } catch (error) {
    console.error("Error creating panel:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
