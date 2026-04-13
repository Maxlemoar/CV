import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

export async function POST() {
  try {
    const client = getClient();
    // Atomic increment in Supabase
    const { data, error } = await client.rpc("next_experiment_number");

    if (error || !data) {
      // Fallback: timestamp-based unique number
      const fallback = Date.now() % 100000;
      return NextResponse.json({ number: fallback });
    }

    return NextResponse.json({ number: data });
  } catch {
    const fallback = Date.now() % 100000;
    return NextResponse.json({ number: fallback });
  }
}
