import type { Connection } from "@xyflow/react";

import { nodeHandles } from "@/lib/workflow/defaults";
import type {
  NodeHandleDefinition,
  NodeKind,
  RunScope,
  WorkflowEdge,
  WorkflowGraph,
  WorkflowNode,
} from "@/lib/workflow/types";

export function getNodeById(graph: WorkflowGraph, nodeId: string) {
  return graph.nodes.find((node) => node.id === nodeId);
}

export function getNodeKind(node?: WorkflowNode): NodeKind | undefined {
  return node?.data.nodeType;
}

export function getHandleDefinition(nodeKind: NodeKind, handleId: string, kind: "input" | "output") {
  return nodeHandles[nodeKind].find((handle) => handle.kind === kind && handle.id === handleId);
}

export function getIncomingEdges(graph: WorkflowGraph, nodeId: string) {
  return graph.edges.filter((edge) => edge.target === nodeId);
}

export function getOutgoingEdges(graph: WorkflowGraph, nodeId: string) {
  return graph.edges.filter((edge) => edge.source === nodeId);
}

export function buildAdjacency(graph: WorkflowGraph) {
  const adjacency = new Map<string, string[]>();

  graph.nodes.forEach((node) => adjacency.set(node.id, []));
  graph.edges.forEach((edge) => {
    adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge.target]);
  });

  return adjacency;
}

export function hasCycle(graph: WorkflowGraph) {
  const adjacency = buildAdjacency(graph);
  const visited = new Set<string>();
  const stack = new Set<string>();

  const visit = (nodeId: string): boolean => {
    if (stack.has(nodeId)) {
      return true;
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    stack.add(nodeId);

    for (const next of adjacency.get(nodeId) ?? []) {
      if (visit(next)) {
        return true;
      }
    }

    stack.delete(nodeId);
    return false;
  };

  return graph.nodes.some((node) => visit(node.id));
}

export function topologicalSort(graph: WorkflowGraph, includedIds?: Set<string>) {
  const ids = includedIds ?? new Set(graph.nodes.map((node) => node.id));
  const incomingCounts = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  ids.forEach((id) => {
    incomingCounts.set(id, 0);
    adjacency.set(id, []);
  });

  graph.edges.forEach((edge) => {
    if (!ids.has(edge.source) || !ids.has(edge.target)) {
      return;
    }

    incomingCounts.set(edge.target, (incomingCounts.get(edge.target) ?? 0) + 1);
    adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge.target]);
  });

  const queue = [...incomingCounts.entries()]
    .filter(([, count]) => count === 0)
    .map(([id]) => id);

  const result: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    for (const next of adjacency.get(current) ?? []) {
      const remaining = (incomingCounts.get(next) ?? 0) - 1;
      incomingCounts.set(next, remaining);

      if (remaining === 0) {
        queue.push(next);
      }
    }
  }

  if (result.length !== ids.size) {
    throw new Error("Workflow must be a DAG.");
  }

  return result;
}

export function collectUpstreamNodeIds(graph: WorkflowGraph, nodeIds: string[]) {
  const required = new Set(nodeIds);
  const visit = (currentId: string) => {
    getIncomingEdges(graph, currentId).forEach((edge) => {
      if (!required.has(edge.source)) {
        required.add(edge.source);
        visit(edge.source);
      }
    });
  };

  nodeIds.forEach(visit);
  return required;
}

export function getExecutionNodeSet(graph: WorkflowGraph, scope: RunScope, selectedNodeIds: string[] = []) {
  if (scope === "full") {
    return new Set(graph.nodes.map((node) => node.id));
  }

  if (scope === "single") {
    return collectUpstreamNodeIds(graph, selectedNodeIds.slice(0, 1));
  }

  return collectUpstreamNodeIds(graph, selectedNodeIds);
}

export function getConnectionValidation(
  graph: WorkflowGraph,
  connection: Connection | WorkflowEdge,
): { valid: boolean; reason?: string } {
  if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
    return { valid: false, reason: "Missing source or target handle." };
  }

  const sourceNode = getNodeById(graph, connection.source);
  const targetNode = getNodeById(graph, connection.target);

  if (!sourceNode || !targetNode) {
    return { valid: false, reason: "Source or target node is missing." };
  }

  if (connection.source === connection.target) {
    return { valid: false, reason: "Nodes cannot connect to themselves." };
  }

  const sourceHandle = getHandleDefinition(sourceNode.data.nodeType, connection.sourceHandle, "output");
  const targetHandle = getHandleDefinition(targetNode.data.nodeType, connection.targetHandle, "input");

  if (!sourceHandle || !targetHandle) {
    return { valid: false, reason: "Handle definition not found." };
  }

  if (sourceHandle.valueKind !== targetHandle.valueKind) {
    return { valid: false, reason: "Handle types do not match." };
  }

  if (!targetHandle.multiple) {
    const existing = graph.edges.find(
      (edge) => edge.target === connection.target && edge.targetHandle === connection.targetHandle,
    );

    if (existing && existing.id !== ("id" in connection ? connection.id : undefined)) {
      return { valid: false, reason: "Target handle already has a connection." };
    }
  }

  const nextGraph: WorkflowGraph = {
    ...graph,
    edges: [
      ...graph.edges,
      {
        id: "preview-edge",
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
      },
    ],
  };

  if (hasCycle(nextGraph)) {
    return { valid: false, reason: "Connection would create a cycle." };
  }

  return { valid: true };
}

export function isInputConnected(edges: WorkflowEdge[], nodeId: string, handleId: string) {
  return edges.some((edge) => edge.target === nodeId && edge.targetHandle === handleId);
}

export function getConnectedEdgesForHandle(edges: WorkflowEdge[], nodeId: string, handleId: string) {
  return edges.filter((edge) => edge.target === nodeId && edge.targetHandle === handleId);
}

export function serializeGraph(graph: WorkflowGraph): WorkflowGraph {
  return {
    ...graph,
    nodes: graph.nodes.map((node) => ({
      ...node,
      selected: false,
      dragging: false,
    })),
  };
}

export function describeHandle(handle?: NodeHandleDefinition) {
  if (!handle) {
    return "";
  }

  return `${handle.label} • ${handle.valueKind}`;
}
