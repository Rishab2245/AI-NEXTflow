import type { WorkflowGraph, WorkflowRecord } from "@/lib/workflow/types";

export function createBlankWorkflowGraph(name = "Untitled Workflow"): WorkflowGraph {
  return {
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 0.82 },
    metadata: {
      name,
      description: "Blank workflow ready for custom automation.",
    },
  };
}

export function createBlankWorkflowRecord(workflowId: string, userId: string, name = "Untitled Workflow"): WorkflowRecord {
  const now = new Date().toISOString();

  return {
    id: workflowId,
    userId,
    name,
    graph: createBlankWorkflowGraph(name),
    createdAt: now,
    updatedAt: now,
  };
}
