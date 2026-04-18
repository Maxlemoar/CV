import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { saveSession, loadSession } from "@/lib/session-store";

export async function POST(req: Request) {
  try {
    const { experimentNumber, profile, visitedNodes, visitorProfile, narrative, generatedContents, blocks } = await req.json();
    const id = nanoid(8);
    await saveSession(id, experimentNumber, profile, visitedNodes, visitorProfile, narrative, generatedContents, blocks);
    return NextResponse.json({ id });
  } catch (err) {
    console.error("Session save error:", err);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const session = await loadSession(id);
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(session);
}
