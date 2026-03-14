import { GoogleGenerativeAI } from "@google/generative-ai";

import { nodeHandles } from "@/lib/workflow/defaults";
import {
  getConnectedEdgesForHandle,
  getExecutionNodeSet,
  getNodeById,
  topologicalSort,
} from "@/lib/workflow/graph";
import type {
  NodeKind,
  NodeOutput,
  RunRequest,
  RunScope,
  RunStatus,
  WorkflowGraph,
  WorkflowNode,
  WorkflowRunNodeRecord,
  WorkflowRunRecord,
} from "@/lib/workflow/types";

type ExecutionContext = {
  graph: WorkflowGraph;
  scope: RunScope;
  userId: string;
  workflowId: string;
  geminiApiKey: string;
  selectedNodeIds?: string[];
};

type ResolvedInputs = Record<string, string | number | string[] | Record<string, unknown> | undefined>;

function sleep(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function getManualInput(node: WorkflowNode, handleId: string) {
  switch (node.data.nodeType) {
    case "text": {
      const config = node.data.config as { content: string };
      return handleId === "output" ? config.content : undefined;
    }
    case "uploadImage": {
      const config = node.data.config as { imageUrl: string };
      return handleId === "output" ? config.imageUrl : undefined;
    }
    case "uploadVideo": {
      const config = node.data.config as { videoUrl: string };
      return handleId === "output" ? config.videoUrl : undefined;
    }
    case "llm": {
      const config = node.data.config as {
        systemPrompt: string;
        userMessage: string;
        result: string;
      };
      if (handleId === "system_prompt") return config.systemPrompt;
      if (handleId === "user_message") return config.userMessage;
      if (handleId === "output") return config.result;
      return undefined;
    }
    case "cropImage": {
      const config = node.data.config as {
        imageUrl: string;
        xPercent: number;
        yPercent: number;
        widthPercent: number;
        heightPercent: number;
      };
      if (handleId === "image_url") return config.imageUrl;
      if (handleId === "x_percent") return config.xPercent;
      if (handleId === "y_percent") return config.yPercent;
      if (handleId === "width_percent") return config.widthPercent;
      if (handleId === "height_percent") return config.heightPercent;
      return undefined;
    }
    case "extractFrame": {
      const config = node.data.config as { videoUrl: string; timestamp: string };
      if (handleId === "video_url") return config.videoUrl;
      if (handleId === "timestamp") return config.timestamp;
      return undefined;
    }
  }
}

function nodeOutputToPrimitive(output?: NodeOutput) {
  if (!output) return undefined;
  if (output.kind === "text") return output.text;
  if (output.kind === "image" || output.kind === "video") return output.url;
  return output.value;
}

export function resolveNodeInputs(
  graph: WorkflowGraph,
  node: WorkflowNode,
  outputsByNodeId: Map<string, NodeOutput>,
) {
  const inputs = nodeHandles[node.data.nodeType].filter((handle) => handle.kind === "input");
  const resolved: ResolvedInputs = {};

  for (const handle of inputs) {
    const connected = getConnectedEdgesForHandle(graph.edges, node.id, handle.id);

    if (connected.length > 0) {
      const values = connected
        .map((edge) => outputsByNodeId.get(edge.source))
        .filter(Boolean)
        .map((value) => nodeOutputToPrimitive(value));

      resolved[handle.id] = handle.multiple ? (values as string[]) : values[0];
      continue;
    }

    resolved[handle.id] = getManualInput(node, handle.id);
  }

  return resolved;
}

async function executeSourceNode(node: WorkflowNode): Promise<NodeOutput> {
  await sleep(80);
  switch (node.data.nodeType) {
    case "text": {
      const config = node.data.config as { content: string };
      return { kind: "text", text: config.content };
    }
    case "uploadImage": {
      const config = node.data.config as { imageUrl: string };
      return {
        kind: "image",
        url:
          config.imageUrl ||
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
      };
    }
    case "uploadVideo": {
      const config = node.data.config as { videoUrl: string };
      return {
        kind: "video",
        url: config.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4",
      };
    }
    default:
      throw new Error("Unsupported source node.");
  }
}

async function executeLlmNode(inputs: ResolvedInputs, geminiApiKey: string) {
  await sleep(450);
  const ai = new GoogleGenerativeAI(geminiApiKey);
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = [
    inputs.system_prompt ? `System: ${inputs.system_prompt}` : undefined,
    `User: ${inputs.user_message ?? ""}`,
    Array.isArray(inputs.images) && inputs.images.length > 0
      ? `Image URLs: ${(inputs.images as string[]).join(", ")}`
      : undefined,
  ]
    .filter(Boolean)
    .join("\n\n");

  const result = await model.generateContent(prompt);

  return {
    kind: "text" as const,
    text: result.response.text(),
  };
}

async function executeCropNode(inputs: ResolvedInputs) {
  await sleep(300);
  const imageUrl = String(inputs.image_url ?? "");
  const query = new URLSearchParams({
    crop: "1",
    x: String(inputs.x_percent ?? 0),
    y: String(inputs.y_percent ?? 0),
    w: String(inputs.width_percent ?? 100),
    h: String(inputs.height_percent ?? 100),
  });

  return {
    kind: "image" as const,
    url: imageUrl ? `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}${query.toString()}` : "",
  };
}

async function executeExtractFrameNode(inputs: ResolvedInputs) {
  await sleep(320);
  const videoUrl = String(inputs.video_url ?? "");
  const timestamp = String(inputs.timestamp ?? "0");

  return {
    kind: "image" as const,
    url: videoUrl
      ? `https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80&frame=${encodeURIComponent(timestamp)}`
      : "",
  };
}

async function executeNode(node: WorkflowNode, inputs: ResolvedInputs, context: ExecutionContext) {
  if (node.data.nodeType === "text" || node.data.nodeType === "uploadImage" || node.data.nodeType === "uploadVideo") {
    return executeSourceNode(node);
  }

  if (node.data.nodeType === "llm") {
    return executeLlmNode(inputs, context.geminiApiKey);
  }

  if (node.data.nodeType === "cropImage") {
    return executeCropNode(inputs);
  }

  return executeExtractFrameNode(inputs);
}

function createNodeRecord(node: WorkflowNode, status: RunStatus): WorkflowRunNodeRecord {
  return {
    id: `${node.id}-${Math.random().toString(36).slice(2, 8)}`,
    nodeId: node.id,
    nodeType: node.data.nodeType,
    nodeLabel: node.data.title,
    status,
  };
}

function shouldMarkAsRunnable(nodeKind: NodeKind) {
  return nodeKind === "llm" || nodeKind === "cropImage" || nodeKind === "extractFrame";
}

export async function executeWorkflow(request: RunRequest, context: ExecutionContext): Promise<WorkflowRunRecord> {
  const startedAt = new Date();
  const outputs = new Map<string, NodeOutput>();
  const runNodeRecords = new Map<string, WorkflowRunNodeRecord>();
  const selectedNodeIds = request.selectedNodeIds ?? [];
  const executionSet = getExecutionNodeSet(context.graph, context.scope, selectedNodeIds);
  const sorted = topologicalSort(context.graph, executionSet);

  const dependencyMap = new Map<string, Set<string>>();
  const dependentsMap = new Map<string, Set<string>>();

  sorted.forEach((nodeId) => {
    dependencyMap.set(nodeId, new Set());
    dependentsMap.set(nodeId, new Set());
  });

  context.graph.edges.forEach((edge) => {
    if (!executionSet.has(edge.source) || !executionSet.has(edge.target)) {
      return;
    }

    dependencyMap.get(edge.target)?.add(edge.source);
    dependentsMap.get(edge.source)?.add(edge.target);
  });

  const completed = new Set<string>();
  const failed = new Set<string>();
  const queued = new Set(sorted.filter((nodeId) => (dependencyMap.get(nodeId)?.size ?? 0) === 0));

  while (queued.size > 0) {
    const currentWave = [...queued];
    queued.clear();

    await Promise.all(
      currentWave.map(async (nodeId) => {
        const node = getNodeById(context.graph, nodeId);
        if (!node) {
          return;
        }

        const nodeStartedAt = new Date();
        const record = createNodeRecord(node, shouldMarkAsRunnable(node.data.nodeType) ? "running" : "success");
        record.startedAt = nodeStartedAt.toISOString();
        runNodeRecords.set(nodeId, record);

        try {
          const inputs = resolveNodeInputs(context.graph, node, outputs);
          record.inputs = inputs;
          const output = await executeNode(node, inputs, context);
          outputs.set(nodeId, output);
          const nodeCompletedAt = new Date();
          record.status = "success";
          record.completedAt = nodeCompletedAt.toISOString();
          record.durationMs = nodeCompletedAt.getTime() - nodeStartedAt.getTime();
          record.outputs = output;
          completed.add(nodeId);
        } catch (error) {
          const nodeCompletedAt = new Date();
          record.status = "failed";
          record.completedAt = nodeCompletedAt.toISOString();
          record.durationMs = nodeCompletedAt.getTime() - nodeStartedAt.getTime();
          record.error = error instanceof Error ? error.message : "Unknown execution error";
          failed.add(nodeId);
        }

        for (const dependentId of dependentsMap.get(nodeId) ?? []) {
          if (completed.has(dependentId) || failed.has(dependentId)) {
            continue;
          }

          const dependencies = dependencyMap.get(dependentId) ?? new Set<string>();
          const unresolved = [...dependencies].filter((dependencyId) => !completed.has(dependencyId));

          if (unresolved.length === 0) {
            queued.add(dependentId);
          }
        }
      }),
    );
  }

  sorted.forEach((nodeId) => {
    if (!runNodeRecords.has(nodeId)) {
      const node = getNodeById(context.graph, nodeId);
      if (!node) return;
      const record = createNodeRecord(node, "skipped");
      record.error = "Node was skipped because an upstream dependency failed.";
      runNodeRecords.set(nodeId, record);
    }
  });

  const completedAt = new Date();
  const durationMs = completedAt.getTime() - startedAt.getTime();
  const status: RunStatus = failed.size > 0 ? "failed" : "success";

  return {
    id: `run-${Math.random().toString(36).slice(2, 10)}`,
    workflowId: context.workflowId,
    userId: context.userId,
    scope: context.scope,
    status,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    durationMs,
    metadata: {
      selectedNodeIds,
    },
    nodes: [...runNodeRecords.values()],
  };
}

export function applyRunToGraph(graph: WorkflowGraph, run: WorkflowRunRecord): WorkflowGraph {
  const nodeRunMap = new Map(run.nodes.map((node) => [node.nodeId, node]));

  return {
    ...graph,
    nodes: graph.nodes.map((node) => {
      const runNode = nodeRunMap.get(node.id);
      if (!runNode) {
        return node;
      }

      const nextNode = {
        ...node,
        data: {
          ...node.data,
          runState: {
            status: runNode.status,
            output: runNode.outputs,
            errorMessage: runNode.error,
            startedAt: runNode.startedAt,
            completedAt: runNode.completedAt,
          },
        },
      };

      if (node.data.nodeType === "llm" && runNode.outputs?.kind === "text") {
        nextNode.data = {
          ...nextNode.data,
          config: {
            ...node.data.config,
            result: runNode.outputs.text,
          },
        };
      }

      return nextNode;
    }),
  };
}
