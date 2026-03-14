import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/server/auth";
import { getRun } from "@/lib/server/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const userId = await requireUserId();
  const { runId } = await params;
  const run = await getRun(runId, userId);

  if (!run) {
    return NextResponse.json({ error: "Run not found." }, { status: 404 });
  }

  return NextResponse.json(run);
}
