import type { Edge, Node, Viewport } from "@xyflow/react";
import { z } from "zod";

export const nodeKinds = [
  "text",
  "uploadImage",
  "uploadVideo",
  "llm",
  "cropImage",
  "extractFrame",
] as const;

export const handleValueKinds = [
  "text",
  "image",
  "video",
  "number",
  "json",
] as const;

export const runScopes = ["full", "selected", "single"] as const;
export const runStatuses = ["idle", "queued", "running", "success", "failed", "skipped"] as const;

export type NodeKind = (typeof nodeKinds)[number];
export type HandleValueKind = (typeof handleValueKinds)[number];
export type RunScope = (typeof runScopes)[number];
export type RunStatus = (typeof runStatuses)[number];

export const textNodeConfigSchema = z.object({
  content: z.string().default(""),
});

export const uploadImageNodeConfigSchema = z.object({
  imageUrl: z.string().default(""),
  fileName: z.string().optional(),
});

export const uploadVideoNodeConfigSchema = z.object({
  videoUrl: z.string().default(""),
  fileName: z.string().optional(),
});

export const llmNodeConfigSchema = z.object({
  model: z.string().default("gemini-2.0-flash"),
  systemPrompt: z.string().default(""),
  userMessage: z.string().default(""),
  result: z.string().default(""),
});

export const cropImageNodeConfigSchema = z.object({
  imageUrl: z.string().default(""),
  xPercent: z.coerce.number().min(0).max(100).default(0),
  yPercent: z.coerce.number().min(0).max(100).default(0),
  widthPercent: z.coerce.number().min(0).max(100).default(100),
  heightPercent: z.coerce.number().min(0).max(100).default(100),
});

export const extractFrameNodeConfigSchema = z.object({
  videoUrl: z.string().default(""),
  timestamp: z.string().default("0"),
});

export const workflowNodeConfigSchema = z.discriminatedUnion("nodeType", [
  z.object({ nodeType: z.literal("text"), config: textNodeConfigSchema }),
  z.object({ nodeType: z.literal("uploadImage"), config: uploadImageNodeConfigSchema }),
  z.object({ nodeType: z.literal("uploadVideo"), config: uploadVideoNodeConfigSchema }),
  z.object({ nodeType: z.literal("llm"), config: llmNodeConfigSchema }),
  z.object({ nodeType: z.literal("cropImage"), config: cropImageNodeConfigSchema }),
  z.object({ nodeType: z.literal("extractFrame"), config: extractFrameNodeConfigSchema }),
]);

export const nodeOutputSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text"), text: z.string() }),
  z.object({ kind: z.literal("image"), url: z.string() }),
  z.object({ kind: z.literal("video"), url: z.string() }),
  z.object({ kind: z.literal("json"), value: z.record(z.string(), z.any()) }),
]);

export type NodeOutput = z.infer<typeof nodeOutputSchema>;

export const nodeRunStateSchema = z.object({
  status: z.enum(runStatuses).default("idle"),
  output: nodeOutputSchema.optional(),
  errorMessage: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
});

export type NodeRunState = z.infer<typeof nodeRunStateSchema>;

export const workflowNodeDataSchema = z.object({
  nodeType: z.enum(nodeKinds),
  title: z.string(),
  subtitle: z.string(),
  config: z.union([
    textNodeConfigSchema,
    uploadImageNodeConfigSchema,
    uploadVideoNodeConfigSchema,
    llmNodeConfigSchema,
    cropImageNodeConfigSchema,
    extractFrameNodeConfigSchema,
  ]),
  runState: nodeRunStateSchema.optional(),
});

export type WorkflowNodeData = z.infer<typeof workflowNodeDataSchema>;
export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export const workflowGraphSchema = z.object({
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  viewport: z.custom<Viewport>().optional(),
  metadata: z
    .object({
      name: z.string(),
      description: z.string().optional(),
      updatedAt: z.string().optional(),
    })
    .default({ name: "Untitled Workflow" }),
});

export type WorkflowGraph = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport?: Viewport;
  metadata: {
    name: string;
    description?: string;
    updatedAt?: string;
  };
};

export type WorkflowRecord = {
  id: string;
  userId: string;
  name: string;
  graph: WorkflowGraph;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowRunNodeRecord = {
  id: string;
  nodeId: string;
  nodeType: NodeKind;
  nodeLabel: string;
  status: RunStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  inputs?: Record<string, unknown>;
  outputs?: NodeOutput;
  error?: string;
};

export type WorkflowRunRecord = {
  id: string;
  workflowId: string;
  userId: string;
  scope: RunScope;
  status: RunStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  nodes: WorkflowRunNodeRecord[];
};

export const runRequestSchema = z.object({
  workflowId: z.string(),
  scope: z.enum(runScopes),
  selectedNodeIds: z.array(z.string()).optional(),
});

export type RunRequest = z.infer<typeof runRequestSchema>;

export const workflowImportSchema = z.object({
  name: z.string(),
  graph: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
    viewport: z.any().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export type WorkflowImportPayload = z.infer<typeof workflowImportSchema>;

export type NodeHandleDefinition = {
  id: string;
  label: string;
  kind: "input" | "output";
  valueKind: HandleValueKind;
  multiple?: boolean;
  required?: boolean;
};
