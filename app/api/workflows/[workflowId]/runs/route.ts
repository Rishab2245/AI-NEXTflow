import { NextResponse } from "next/server";

import { executeWorkflow } from "@/lib/workflow/execution";
import { requireUserId } from "@/lib/server/auth";
import { ensureWorkflow, getUserGeminiApiKey, listRuns, persistRun } from "@/lib/server/storage";
import { runRequestSchema } from "@/lib/workflow/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ workflowId: string }> },
) {
  const userId = await requireUserId();
  const { workflowId } = await params;
  const runs = await listRuns(workflowId, userId);

  return NextResponse.json(runs);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workflowId: string }> },
) {
  const userId = await requireUserId();
  const { workflowId } = await params;
  const parsed = runRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid run payload." }, { status: 400 });
  }

  const geminiApiKey = await getUserGeminiApiKey(userId);
  if (!geminiApiKey) {
    return NextResponse.json(
      { error: "Add your Gemini API key in Settings before running a workflow." },
      { status: 400 },
    );
  }

  const workflow = await ensureWorkflow(workflowId, userId);
  const run = await executeWorkflow(parsed.data, {
    graph: workflow.graph,
    scope: parsed.data.scope,
    selectedNodeIds: parsed.data.selectedNodeIds,
    userId,
    workflowId,
    geminiApiKey,
  });

  await persistRun(run);
  return NextResponse.json(run);
}
