"use client";

import "@xyflow/react/dist/style.css";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { useEffect, useState } from "react";

import { LeftSidebar } from "@/components/workflow/left-sidebar";
import { workflowNodeTypes } from "@/components/workflow/nodes";
import { RightSidebar } from "@/components/workflow/right-sidebar";
import { buildRunRequest, useWorkflowStore } from "@/components/workflow/store";
import { Topbar } from "@/components/workflow/topbar";
import { applyRunToGraph } from "@/lib/workflow/execution";
import { serializeGraph } from "@/lib/workflow/graph";
import type { WorkflowGraph, WorkflowRunRecord } from "@/lib/workflow/types";

function EditorCanvas() {
  const reactFlow = useReactFlow();
  const graph = useWorkflowStore((state) => state.graph);
  const onNodesChange = useWorkflowStore((state) => state.onNodesChange);
  const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange);
  const onConnect = useWorkflowStore((state) => state.onConnect);
  const replaceGraph = useWorkflowStore((state) => state.replaceGraph);
  const prependRun = useWorkflowStore((state) => state.prependRun);
  const workflowId = useWorkflowStore((state) => state.workflowId);
  const [notice, setNotice] = useState<string>("");

  async function saveWorkflow() {
    const response = await fetch(`/api/workflows/${workflowId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        graph: serializeGraph({
          ...graph,
          viewport: reactFlow.getViewport(),
        }),
      }),
    });

    if (!response.ok) {
      setNotice("Unable to save workflow.");
      return;
    }

    setNotice("Workflow saved.");
  }

  async function runWorkflow(scope: "full" | "selected" | "single") {
    const request = buildRunRequest(scope, graph);
    request.workflowId = workflowId;
    replaceGraph({
      ...graph,
      nodes: graph.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          runState: {
            ...(node.data.runState ?? { status: "idle" }),
            status: "running",
            errorMessage: undefined,
          },
        },
      })),
    });

    const response = await fetch(`/api/workflows/${workflowId}/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unable to run workflow." }));
      setNotice(error.error ?? "Unable to run workflow.");
      return;
    }

    const run = (await response.json()) as WorkflowRunRecord;
    prependRun(run);
    replaceGraph(applyRunToGraph(graph, run));
    setNotice(`Run ${run.id} completed with status ${run.status}.`);
  }

  async function exportWorkflow() {
    const response = await fetch(`/api/workflows/${workflowId}/export`);
    const payload = await response.json();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${graph.metadata.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importWorkflow(file: File) {
    const text = await file.text();
    const response = await fetch("/api/workflows/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: text,
    });

    if (!response.ok) {
      setNotice("Unable to import workflow.");
      return;
    }

    const workflow = await response.json();
    replaceGraph(workflow.graph);
    setNotice(`Imported ${workflow.name}.`);
  }

  return (
    <div className="grid h-screen min-h-screen grid-cols-1 gap-3 overflow-hidden bg-[#090a0f] p-3 text-white xl:grid-cols-[252px_minmax(0,1fr)_320px]">
      <LeftSidebar />
      <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-4">
        <Topbar onSave={saveWorkflow} onRun={runWorkflow} onExport={exportWorkflow} onImport={importWorkflow} />
        <div className="relative min-h-0 overflow-hidden rounded-[36px] border border-white/10 bg-[#090a0f]">
          <ReactFlow
            nodes={graph.nodes}
            edges={graph.edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={(connection) => {
              const result = onConnect(connection);
              if (!result.success) {
                setNotice(result.reason ?? "Invalid connection.");
              }
            }}
            nodeTypes={workflowNodeTypes}
            deleteKeyCode={["Backspace", "Delete"]}
            fitView
            fitViewOptions={{ padding: 0.16, maxZoom: 0.84 }}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: "#7562ff", strokeWidth: 2 },
            }}
            minZoom={0.4}
            maxZoom={1.8}
            className="bg-[radial-gradient(circle_at_top,rgba(112,97,255,0.08),transparent_35%),linear-gradient(180deg,#11131b,#090a0f)]"
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1.2} color="rgba(255,255,255,0.08)" />
            <MiniMap
              pannable
              zoomable
              style={{
                background: "rgba(18, 18, 24, 0.96)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
              }}
              nodeColor="#7562ff"
              maskColor="rgba(255,255,255,0.04)"
            />
            <Controls
              className="!rounded-2xl !border !border-white/10 !bg-black/60 !text-white !backdrop-blur-xl"
              showInteractive={false}
            />
          </ReactFlow>
          {notice ? (
            <div className="absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-zinc-200 backdrop-blur-xl">
              {notice}
            </div>
          ) : null}
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}

export function WorkflowEditor({
  workflowId,
  initialGraph,
  initialRuns,
}: {
  workflowId: string;
  initialGraph: WorkflowGraph;
  initialRuns: WorkflowRunRecord[];
}) {
  const initialize = useWorkflowStore((state) => state.initialize);

  useEffect(() => {
    initialize(workflowId, initialGraph, initialRuns);
  }, [initialize, workflowId, initialGraph, initialRuns]);

  return (
    <ReactFlowProvider>
      <EditorCanvas />
    </ReactFlowProvider>
  );
}
