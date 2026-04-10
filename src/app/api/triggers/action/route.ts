import { NextRequest, NextResponse } from "next/server";
import { moveTrigger } from "@/lib/triggers";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { filename, action } = body as { filename: string; action: "approve" | "reject" | "defer" };

  if (!filename || !action) {
    return NextResponse.json({ error: "Missing filename or action" }, { status: 400 });
  }

  const targetMap: Record<string, string> = {
    approve: "approved",
    reject: "rejected",
    defer: "pending", // defer keeps it in pending (no-op for single, but useful for batch)
  };

  const target = targetMap[action];
  if (!target) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (action === "defer") {
    return NextResponse.json({ success: true, action: "defer", filename });
  }

  const success = moveTrigger(filename, "pending", target);
  if (!success) {
    return NextResponse.json({ error: "Failed to move trigger file" }, { status: 500 });
  }

  return NextResponse.json({ success: true, action, filename, destination: target });
}
