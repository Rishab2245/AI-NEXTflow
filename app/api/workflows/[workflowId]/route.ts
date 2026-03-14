import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/server/auth";
import { ensureWorkflow, saveWorkflow } from "@/lib/server/storage";
import { workflowImportSchema } from "@/lib/workflow/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workflowId: string }> },
) {
  const userId = await requireUserId(); 
  const { workflowId } = await params;
  const workflow = await ensureWorkflow(workflowId, userId);

  return NextResponse.json(workflow);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workflowId: string }> },
) {
  const userId = await requireUserId();
  const { workflowId } = await params;
  const body = (await request.json()) as { graph: unknown };
  const parsed = workflowImportSchema.pick({ graph: true }).safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid workflow payload." }, { status: 400 });
  }

  const workflow = await saveWorkflow(workflowId, userId, {
    nodes: parsed.data.graph.nodes,
    edges: parsed.data.graph.edges,
    viewport: parsed.data.graph.viewport,
    metadata: {
      name:
        (parsed.data.graph.metadata as { name?: string } | undefined)?.name ??
        "Imported Workflow",
    },
  });

  return NextResponse.json(workflow);
}
