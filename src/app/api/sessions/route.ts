import { nanoid } from "nanoid";
import { saveSession, loadSession } from "@/lib/session-store";

export async function POST(req: Request) {
  const { blocks } = await req.json();
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return Response.json({ error: "No blocks provided" }, { status: 400 });
  }

  const id = nanoid(8);
  await saveSession(id, blocks);
  return Response.json({ id });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const session = await loadSession(id);
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });

  return Response.json(session);
}
