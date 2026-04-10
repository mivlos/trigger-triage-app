import { NextRequest, NextResponse } from "next/server";
import { moveTrigger } from "@/lib/triggers";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { filenames, action } = body as { filenames: string[]; action: "approve" | "reject" };

  if (!filenames?.length || !action) {
    return NextResponse.json({ error: "Missing filenames or action" }, { status: 400 });
  }

  const target = action === "approve" ? "approved" : "rejected";
  const results: { filename: string; success: boolean }[] = [];

  for (const filename of filenames) {
    const success = moveTrigger(filename, "pending", target);
    results.push({ filename, success });
  }

  return NextResponse.json({ results, action, destination: target });
}
