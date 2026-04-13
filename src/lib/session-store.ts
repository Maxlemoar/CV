import { createClient } from "@supabase/supabase-js";
import type { ExperimentProfile } from "@/lib/experiment-types";

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

export async function saveSession(
  id: string,
  experimentNumber: number,
  profile: ExperimentProfile,
  visitedNodes: string[]
): Promise<void> {
  const client = getClient();
  const { error } = await client.from("sessions").insert({
    id,
    experiment_number: experimentNumber,
    profile: JSON.stringify(profile),
    visited_nodes: JSON.stringify(visitedNodes),
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function loadSession(id: string): Promise<{
  id: string;
  experimentNumber: number;
  profile: ExperimentProfile;
  visitedNodes: string[];
  createdAt: string;
} | null> {
  const client = getClient();
  const { data, error } = await client
    .from("sessions")
    .select("id, experiment_number, profile, visited_nodes, created_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    experimentNumber: data.experiment_number,
    profile: typeof data.profile === "string" ? JSON.parse(data.profile) : data.profile,
    visitedNodes: typeof data.visited_nodes === "string" ? JSON.parse(data.visited_nodes) : data.visited_nodes,
    createdAt: data.created_at,
  };
}
