import { ImageResponse } from "next/og";
import { loadSession } from "@/lib/session-store";
import { DIMENSION_LABELS } from "@/lib/experiment-types";
import { TOTAL_EGGS } from "@/lib/egg-context";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await loadSession(id);

  if (!session) {
    return new Response("Not found", { status: 404 });
  }

  const { profile, visitedNodes, foundEggs } = session;
  const eggCount = foundEggs.length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #faf8f5, #fff8f0)",
          fontFamily: "Georgia, serif",
        }}
      >
        <p style={{ fontSize: "14px", letterSpacing: "3px", color: "#999", marginBottom: "30px" }}>
          EXPERIMENT #{profile.experimentNumber}
        </p>
        <p style={{ fontSize: "32px", color: "#1a1a1a", marginBottom: "8px" }}>
          You are convinced by
        </p>
        <p style={{ fontSize: "40px", color: "#e8734a", fontWeight: "bold", marginBottom: "40px" }}>
          {DIMENSION_LABELS.persuasion[profile.persuasion]}
        </p>
        <div style={{ display: "flex", gap: "60px", marginBottom: "40px" }}>
          <div>
            <p style={{ fontSize: "14px", color: "#999" }}>Interest</p>
            <p style={{ fontSize: "20px", color: "#333" }}>
              {DIMENSION_LABELS.contentInterest[profile.contentInterest]}
            </p>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "#999" }}>Drive</p>
            <p style={{ fontSize: "20px", color: "#333" }}>
              {DIMENSION_LABELS.motivation[profile.motivation]}
            </p>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "#999" }}>Topics explored</p>
            <p style={{ fontSize: "20px", color: "#333" }}>
              {visitedNodes.length}
            </p>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "#999" }}>Easter eggs</p>
            <p style={{ fontSize: "20px", color: "#333" }}>
              {eggCount}/{TOTAL_EGGS}
            </p>
          </div>
        </div>
        <p style={{ fontSize: "16px", color: "#999", borderTop: "1px solid #e0d8d0", paddingTop: "20px" }}>
          Every journey is unique · Start yours
        </p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
