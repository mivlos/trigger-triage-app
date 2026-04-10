import { NextRequest, NextResponse } from "next/server";
import { loadTriggers } from "@/lib/triggers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") as "pending" | "approved" | "rejected" | null;
  const triggers = loadTriggers(status || undefined);
  return NextResponse.json({ triggers });
}
