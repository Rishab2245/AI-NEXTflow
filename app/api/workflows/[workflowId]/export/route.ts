import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/server/auth";
import { ensureWorkflow } from "@/lib/server/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workflowId: string }> },
) {
  const userId = await requireUserId();
  const { workflowId } = await params;
  const workflow = await ensureWorkflow(workflowId, userId);

  return NextResponse.json({
    id: workflow.id,
    name: workflow.name,
    graph: workflow.graph,
    exportedAt: new Date().toISOString(),
  });
}
