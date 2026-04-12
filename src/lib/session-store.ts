import { createClient } from "@supabase/supabase-js";
import type { ContentBlockData, SessionData } from "@/lib/types";

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

export async function saveSession(id: string, blocks: ContentBlockData[]): Promise<void> {
  const client = getClient();
  const { error } = await client.from("sessions").insert({
    id,
    blocks: JSON.stringify(blocks),
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function loadSession(id: string): Promise<SessionData | null> {
  const client = getClient();
  const { data, error } = await client
    .from("sessions")
    .select("id, blocks, created_at")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    blocks: typeof data.blocks === "string" ? JSON.parse(data.blocks) : data.blocks,
    createdAt: data.created_at,
  };
}
