import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    console.log("[api/auth/me] no session returned from getServerSession()");
    return NextResponse.json({ user: null }, { status: 401 });
  }

  console.log("[api/auth/me] session:", {
    id: session.user.id,
    name: session.user.name,
    discordId: session.user.discordId,
  });

  return NextResponse.json({
    status: "ok",
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      discordId: session.user.discordId,
    },
  });
}
