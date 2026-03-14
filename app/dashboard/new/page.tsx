import { redirect } from "next/navigation";

import { requireUserId } from "@/lib/server/auth";
import { createWorkflow } from "@/lib/server/storage";

export default async function NewWorkflowPage() {
  const userId = await requireUserId();
  const workflow = await createWorkflow(userId, { template: "blank", name: "New Workflow" });

  redirect(`/workflows/${workflow.id}`);
}
