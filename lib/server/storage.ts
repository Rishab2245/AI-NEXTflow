import { DEFAULT_WORKFLOW_ID } from "@/lib/constants";
import { decryptValue, encryptValue, maskApiKey } from "@/lib/server/encryption";
import { createSampleWorkflowRecord } from "@/lib/workflow/sample";
import { createBlankWorkflowGraph, createBlankWorkflowRecord } from "@/lib/workflow/blank";
import type {
  WorkflowGraph,
  WorkflowImportPayload,
  WorkflowRecord,
  WorkflowRunRecord,
} from "@/lib/workflow/types";
import { getPrisma } from "@/lib/server/prisma";

const globalMemory = globalThis as unknown as {
  nextflowMemory?: {
    workflows: Map<string, WorkflowRecord>;
    runs: Map<string, WorkflowRunRecord[]>;
    geminiSecrets: Map<string, string>;
  };
};

function getMemory() {
  if (!globalMemory.nextflowMemory) {
    globalMemory.nextflowMemory = {
      workflows: new Map(),
      runs: new Map(),
      geminiSecrets: new Map(),
    };
  }

  return globalMemory.nextflowMemory;
}

function shouldUseDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim()?.startsWith("postgres"));
}

function logStorageFallback(error: unknown, action: string) {
  console.warn(`[storage] Falling back to in-memory mode during ${action}.`, error);
}

function mapWorkflowRecord(input: {
  id: string;
  userId: string;
  name: string;
  graph: unknown;
  createdAt: Date | string;
  updatedAt: Date | string;
}): WorkflowRecord {
  return {
    id: input.id,
    userId: input.userId,
    name: input.name,
    graph: input.graph as WorkflowGraph,
    createdAt: new Date(input.createdAt).toISOString(),
    updatedAt: new Date(input.updatedAt).toISOString(),
  };
}

export async function ensureWorkflow(workflowId: string, userId: string) {
  const existing = await getWorkflow(workflowId, userId);
  if (existing) return existing;

  if (workflowId === DEFAULT_WORKFLOW_ID) {
    const sample = createSampleWorkflowRecord(userId);
    sample.id = workflowId;
    return saveWorkflow(workflowId, userId, sample.graph);
  }

  const blank = createBlankWorkflowRecord(workflowId, userId);
  return saveWorkflow(workflowId, userId, blank.graph);
}

export async function getWorkflow(workflowId: string, userId: string) {
  const readFromMemory = () => {
    const memory = getMemory();
    const stored = memory.workflows.get(workflowId);

    if (stored?.userId === userId) {
      return stored;
    }

    return null;
  };

  if (!shouldUseDatabase()) {
    return readFromMemory();
  }

  try {
    const prisma = getPrisma();
    if (!prisma) {
      return readFromMemory();
    }

    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, userId },
    });

    return workflow ? mapWorkflowRecord(workflow) : null;
  } catch (error) {
    logStorageFallback(error, "getWorkflow");
    return readFromMemory();
  }
}

export async function saveWorkflow(workflowId: string, userId: string, graph: WorkflowGraph) {
  const now = new Date().toISOString();
  const saveToMemory = () => {
    const memory = getMemory();
    const existing = memory.workflows.get(workflowId);
    const nextRecord: WorkflowRecord = {
      id: workflowId,
      userId,
      name: graph.metadata.name,
      graph,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    memory.workflows.set(workflowId, nextRecord);
    return nextRecord;
  };

  if (!shouldUseDatabase()) {
    return saveToMemory();
  }

  try {
    const prisma = getPrisma();
    if (!prisma) {
      return saveToMemory();
    }

    const workflow = await prisma.workflow.upsert({
      where: { id: workflowId },
      update: {
        name: graph.metadata.name,
        graph: graph as unknown as object,
        versions: {
          create: {
            graph: graph as unknown as object,
          },
        },
      },
      create: {
        id: workflowId,
        userId,
        name: graph.metadata.name,
        graph: graph as unknown as object,
        versions: {
          create: {
            graph: graph as unknown as object,
          },
        },
      },
    });

    return mapWorkflowRecord(workflow);
  } catch (error) {
    logStorageFallback(error, "saveWorkflow");
    return saveToMemory();
  }
}

export async function listWorkflows(userId: string) {
  const listFromMemory = () => {
    const memory = getMemory();
    const existing = [...memory.workflows.values()].filter((workflow) => workflow.userId === userId);

    if (existing.length === 0) {
      const seeded = createSampleWorkflowRecord(userId);
      memory.workflows.set(seeded.id, seeded);
      existing.push(seeded);
    }

    return existing.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  };

  if (!shouldUseDatabase()) {
    return listFromMemory();
  }

  try {
    const prisma = getPrisma();
    if (!prisma) {
      return listFromMemory();
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    if (workflows.length === 0) {
      await saveWorkflow(DEFAULT_WORKFLOW_ID, userId, createSampleWorkflowRecord(userId).graph);
      return listWorkflows(userId);
    }

    return workflows.map(mapWorkflowRecord);
  } catch (error) {
    logStorageFallback(error, "listWorkflows");
    return listFromMemory();
  }
}

export async function createWorkflow(userId: string, options?: { name?: string; template?: "blank" | "sample" }) {
  const workflowId = `workflow-${Math.random().toString(36).slice(2, 10)}`;
  const template = options?.template ?? "blank";
  const name =
    options?.name ?? (template === "sample" ? "Product Marketing Kit Generator" : "Untitled Workflow");

  const graph =
    template === "sample" ? createSampleWorkflowRecord(userId).graph : createBlankWorkflowGraph(name);

  return saveWorkflow(workflowId, userId, {
    ...graph,
    metadata: {
      ...graph.metadata,
      name,
    },
  });
}

export async function setUserGeminiApiKey(userId: string, rawApiKey: string) {
  const encrypted = encryptValue(rawApiKey.trim());

  const saveToMemory = () => {
    const memory = getMemory();
    memory.geminiSecrets.set(userId, encrypted);
  };

  if (!shouldUseDatabase()) {
    saveToMemory();
    return;
  }

  try {
    const prisma = getPrisma();
    if (!prisma) {
      saveToMemory();
      return;
    }

    await prisma.userSecret.upsert({
      where: { userId },
      update: { geminiApiKeyEncrypted: encrypted },
      create: { userId, geminiApiKeyEncrypted: encrypted },
    });
  } catch (error) {
    logStorageFallback(error, "setUserGeminiApiKey");
    saveToMemory();
  }
}

export async function getUserGeminiApiKey(userId: string) {
  const readFromMemory = () => {
    const encrypted = getMemory().geminiSecrets.get(userId);
    if (!encrypted) return null;

    try {
      return decryptValue(encrypted);
    } catch {
      return null;
    }
  };

  if (!shouldUseDatabase()) {
    return readFromMemory();
  }

  try {
    const prisma = getPrisma();
    if (!prisma) {
      return readFromMemory();
    }

    const secret = await prisma.userSecret.findUnique({
      where: { userId },
      select: { geminiApiKeyEncrypted: true },
    });

    if (!secret?.geminiApiKeyEncrypted) {
      return null;
    }

    return decryptValue(secret.geminiApiKeyEncrypted);
  } catch (error) {
    logStorageFallback(error, "getUserGeminiApiKey");
    return readFromMemory();
  }
}

export async function getUserGeminiApiKeyStatus(userId: string) {
  const key = await getUserGeminiApiKey(userId);

  if (!key) {
    return {
      configured: false,
      maskedKey: null,
    };
  }

  return {
    configured: true,
    maskedKey: maskApiKey(key),
  };
}

export async function listRuns(workflowId: string, userId: string) {
  const listFromMemory = () => {
    return getMemory()
      .runs.get(workflowId)
      ?.filter((run) => run.userId === userId)
      .sort((left, right) => right.startedAt.localeCompare(left.startedAt)) ?? [];
  };

  if (!shouldUseDatabase()) {
    return listFromMemory();
  }

  try {
    const prisma = getPrisma();
    if (!prisma) {
      return listFromMemory();
    }

    const runs = await prisma.workflowRun.findMany({
      where: { workflowId, userId },
      include: { nodes: true },
      orderBy: { startedAt: "desc" },
    });

    return runs.map((run) => ({
      id: run.id,
      workflowId: run.workflowId,
      userId: run.userId,
      scope: run.scope as WorkflowRunRecord["scope"],
      status: run.status as WorkflowRunRecord["status"],
      startedAt: run.startedAt.toISOString(),
      completedAt: run.completedAt?.toISOString(),
      durationMs: run.durationMs ?? undefined,
      metadata: (run.metadata as Record<string, unknown> | null) ?? undefined,
      nodes: run.nodes.map((node) => ({
        id: node.id,
        nodeId: node.nodeId,
        nodeType: node.nodeType as WorkflowRunRecord["nodes"][number]["nodeType"],
        nodeLabel: node.nodeLabel ?? node.nodeId,
        status: node.status as WorkflowRunRecord["nodes"][number]["status"],
        startedAt: node.startedAt?.toISOString(),
        completedAt: node.completedAt?.toISOString(),
        durationMs: node.durationMs ?? undefined,
        inputs: (node.inputs as Record<string, unknown> | null) ?? undefined,
        outputs: node.outputs as WorkflowRunRecord["nodes"][number]["outputs"],
        error: node.error ?? undefined,
      })),
    }));
  } catch (error) {
    logStorageFallback(error, "listRuns");
    return listFromMemory();
  }
}

export async function getRun(runId: string, userId: string) {
  const getFromMemory = () => {
    const memory = getMemory();
    const allRuns = [...memory.runs.values()].flat();
    return allRuns.find((run) => run.id === runId && run.userId === userId) ?? null;
  };

  if (!shouldUseDatabase()) {
    return getFromMemory();
  }

  try {
    const prisma = getPrisma();
    if (!prisma) {
      return getFromMemory();
    }

    const run = await prisma.workflowRun.findFirst({
      where: { id: runId, userId },
      include: { nodes: true },
    });

    if (!run) return null;

    return {
      id: run.id,
      workflowId: run.workflowId,
      userId: run.userId,
      scope: run.scope as WorkflowRunRecord["scope"],
      status: run.status as WorkflowRunRecord["status"],
      startedAt: run.startedAt.toISOString(),
      completedAt: run.completedAt?.toISOString(),
      durationMs: run.durationMs ?? undefined,
      metadata: (run.metadata as Record<string, unknown> | null) ?? undefined,
      nodes: run.nodes.map((node) => ({
        id: node.id,
        nodeId: node.nodeId,
        nodeType: node.nodeType as WorkflowRunRecord["nodes"][number]["nodeType"],
        nodeLabel: node.nodeLabel ?? node.nodeId,
        status: node.status as WorkflowRunRecord["nodes"][number]["status"],
        startedAt: node.startedAt?.toISOString(),
        completedAt: node.completedAt?.toISOString(),
        durationMs: node.durationMs ?? undefined,
        inputs: (node.inputs as Record<string, unknown> | null) ?? undefined,
        outputs: node.outputs as WorkflowRunRecord["nodes"][number]["outputs"],
        error: node.error ?? undefined,
      })),
    };
  } catch (error) {
    logStorageFallback(error, "getRun");
    return getFromMemory();
  }
}

export async function persistRun(run: WorkflowRunRecord) {
  const persistToMemory = () => {
    const memory = getMemory();
    const runs = memory.runs.get(run.workflowId) ?? [];
    memory.runs.set(run.workflowId, [run, ...runs]);
    return run;
  };

  if (!shouldUseDatabase()) {
    return persistToMemory();
  }

  try {
    const prisma = getPrisma();
    if (!prisma) {
      return persistToMemory();
    }

    await prisma.workflowRun.create({
      data: {
        id: run.id,
        workflowId: run.workflowId,
        userId: run.userId,
        scope: run.scope,
        status: run.status,
        startedAt: new Date(run.startedAt),
        completedAt: run.completedAt ? new Date(run.completedAt) : undefined,
        durationMs: run.durationMs,
        metadata: run.metadata as object | undefined,
        nodes: {
          create: run.nodes.map((node) => ({
            id: node.id,
            nodeId: node.nodeId,
            nodeType: node.nodeType,
            nodeLabel: node.nodeLabel,
            status: node.status,
            startedAt: node.startedAt ? new Date(node.startedAt) : undefined,
            completedAt: node.completedAt ? new Date(node.completedAt) : undefined,
            durationMs: node.durationMs,
            inputs: node.inputs as object | undefined,
            outputs: node.outputs as object | undefined,
            error: node.error,
          })),
        },
      },
    });

    return run;
  } catch (error) {
    logStorageFallback(error, "persistRun");
    return persistToMemory();
  }
}

export async function importWorkflow(payload: WorkflowImportPayload, userId: string) {
  const workflowId = `workflow-${Math.random().toString(36).slice(2, 10)}`;
  const graph: WorkflowGraph = {
    nodes: payload.graph.nodes as WorkflowGraph["nodes"],
    edges: payload.graph.edges as WorkflowGraph["edges"],
    viewport: payload.graph.viewport as WorkflowGraph["viewport"],
    metadata: {
      name: payload.name,
    },
  };

  return saveWorkflow(workflowId, userId, graph);
}
