import { WorkflowEditor } from "@/components/workflow/editor";
import { requireUserId } from "@/lib/server/auth";
import { ensureWorkflow, listRuns } from "@/lib/server/storage";

export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const { workflowId } = await params;
  const userId = await requireUserId();
  const workflow = await ensureWorkflow(workflowId, userId);
  const runs = await listRuns(workflowId, userId);

  return <WorkflowEditor workflowId={workflowId} initialGraph={workflow.graph} initialRuns={runs} />;
}
