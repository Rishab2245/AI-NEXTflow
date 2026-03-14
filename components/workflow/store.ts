"use client";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type Viewport,
} from "@xyflow/react";
import { create } from "zustand";

import { createNode } from "@/lib/workflow/defaults";
import { getConnectionValidation, serializeGraph } from "@/lib/workflow/graph";
import type {
  NodeKind,
  RunRequest,
  WorkflowEdge,
  WorkflowGraph,
  WorkflowNode,
  WorkflowRunRecord,
} from "@/lib/workflow/types";

type EditorSnapshot = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport?: Viewport;
};

type WorkflowStore = {
  workflowId: string;
  graph: WorkflowGraph;
  past: EditorSnapshot[];
  future: EditorSnapshot[];
  activeRunId?: string;
  runs: WorkflowRunRecord[];
  expandedRunIds: string[];
  initialize: (workflowId: string, graph: WorkflowGraph, runs: WorkflowRunRecord[]) => void;
  setViewport: (viewport: Viewport) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (edge: Connection) => { success: boolean; reason?: string };
  addNode: (kind: NodeKind) => void;
  updateNodeConfig: (nodeId: string, nextConfig: Record<string, unknown>) => void;
  replaceGraph: (graph: WorkflowGraph) => void;
  undo: () => void;
  redo: () => void;
  setRuns: (runs: WorkflowRunRecord[]) => void;
  prependRun: (run: WorkflowRunRecord) => void;
  toggleRunExpanded: (runId: string) => void;
  setActiveRunId: (runId?: string) => void;
};

function snapshot(graph: WorkflowGraph): EditorSnapshot {
  return {
    nodes: graph.nodes,
    edges: graph.edges,
    viewport: graph.viewport,
  };
}

const emptyGraph: WorkflowGraph = {
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  metadata: { name: "Untitled Workflow" },
};

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflowId: "",
  graph: emptyGraph,
  past: [],
  future: [],
  activeRunId: undefined,
  runs: [],
  expandedRunIds: [],
  initialize: (workflowId, graph, runs) =>
    set({
      workflowId,
      graph,
      runs,
      past: [],
      future: [],
      expandedRunIds: runs[0] ? [runs[0].id] : [],
    }),
  setViewport: (viewport) =>
    set((state) => ({
      graph: { ...state.graph, viewport },
    })),
  setNodes: (nodes) =>
    set((state) => ({
      past: [...state.past, snapshot(state.graph)],
      future: [],
      graph: { ...state.graph, nodes },
    })),
  setEdges: (edges) =>
    set((state) => ({
      past: [...state.past, snapshot(state.graph)],
      future: [],
      graph: { ...state.graph, edges },
    })),
  onNodesChange: (changes) =>
    set((state) => ({
      graph: {
        ...state.graph,
        nodes: applyNodeChanges(changes, state.graph.nodes) as WorkflowNode[],
      },
    })),
  onEdgesChange: (changes) =>
    set((state) => ({
      graph: {
        ...state.graph,
        edges: applyEdgeChanges(changes, state.graph.edges) as WorkflowEdge[],
      },
    })),
  onConnect: (connection) => {
    const state = get();
    const validation = getConnectionValidation(state.graph, connection);

    if (!validation.valid) {
      return { success: false, reason: validation.reason };
    }

    set({
      past: [...state.past, snapshot(state.graph)],
      future: [],
        graph: {
          ...state.graph,
          edges: addEdge(
            {
              ...connection,
              id: `edge-${Math.random().toString(36).slice(2, 10)}`,
              animated: true,
              style: { stroke: "#7562ff", strokeWidth: 2 },
            },
            state.graph.edges,
          ) as WorkflowEdge[],
        },
      });

    return { success: true };
  },
  addNode: (kind) =>
    set((state) => {
      const nextIndex = state.graph.nodes.length;
      const nextNode = createNode(kind, `${kind}-${Date.now()}`, 220 + (nextIndex % 3) * 320, 120 + nextIndex * 70);

      return {
        past: [...state.past, snapshot(state.graph)],
        future: [],
        graph: {
          ...state.graph,
          nodes: [...state.graph.nodes, nextNode],
        },
      };
    }),
  updateNodeConfig: (nodeId, nextConfig) =>
    set((state) => ({
      graph: {
        ...state.graph,
        nodes: state.graph.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  config: {
                    ...node.data.config,
                    ...nextConfig,
                  },
                },
              }
            : node,
        ),
      },
    })),
  replaceGraph: (graph) =>
    set((state) => ({
      past: [...state.past, snapshot(state.graph)],
      future: [],
      graph: serializeGraph(graph),
    })),
  undo: () =>
    set((state) => {
      const previous = state.past.at(-1);
      if (!previous) return state;

      return {
        ...state,
        past: state.past.slice(0, -1),
        future: [snapshot(state.graph), ...state.future],
        graph: { ...state.graph, ...previous },
      };
    }),
  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) return state;

      return {
        ...state,
        past: [...state.past, snapshot(state.graph)],
        future: state.future.slice(1),
        graph: { ...state.graph, ...next },
      };
    }),
  setRuns: (runs) => set({ runs }),
  prependRun: (run) =>
    set((state) => ({
      runs: [run, ...state.runs.filter((existing) => existing.id !== run.id)],
      expandedRunIds: [run.id, ...state.expandedRunIds.filter((id) => id !== run.id)],
    })),
  toggleRunExpanded: (runId) =>
    set((state) => ({
      expandedRunIds: state.expandedRunIds.includes(runId)
        ? state.expandedRunIds.filter((id) => id !== runId)
        : [...state.expandedRunIds, runId],
    })),
  setActiveRunId: (runId) => set({ activeRunId: runId }),
}));

export function buildRunRequest(scope: RunRequest["scope"], graph: WorkflowGraph): RunRequest {
  const selectedNodeIds = graph.nodes.filter((node) => node.selected).map((node) => node.id);

  return {
    workflowId: "",
    scope,
    selectedNodeIds:
      scope === "selected" ? selectedNodeIds : scope === "single" ? selectedNodeIds.slice(0, 1) : undefined,
  };
}
