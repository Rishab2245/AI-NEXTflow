import { describe, expect, it, vi } from "vitest";

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: async () => ({
          response: {
            text: () => "Mocked Gemini output",
          },
        }),
      };
    }
  },
}));

import { executeWorkflow } from "@/lib/workflow/execution";
import { getConnectionValidation, getExecutionNodeSet, hasCycle, topologicalSort } from "@/lib/workflow/graph";
import { sampleWorkflowGraph } from "@/lib/workflow/sample";

describe("workflow graph rules", () => {
  it("keeps the seeded workflow acyclic", () => {
    expect(hasCycle(sampleWorkflowGraph)).toBe(false);
    expect(topologicalSort(sampleWorkflowGraph)).toContain("llm-converge");
  });

  it("rejects invalid handle type connections", () => {
    const result = getConnectionValidation(sampleWorkflowGraph, {
      source: "image-upload",
      sourceHandle: "output",
      target: "llm-branch-a",
      targetHandle: "user_message",
    });

    expect(result.valid).toBe(false);
  });

  it("includes upstream dependencies for selected and single runs", () => {
    const selected = getExecutionNodeSet(sampleWorkflowGraph, "selected", ["llm-converge"]);
    const single = getExecutionNodeSet(sampleWorkflowGraph, "single", ["extract-frame"]);

    expect(selected.has("crop-image")).toBe(true);
    expect(selected.has("text-system")).toBe(true);
    expect(single.has("video-upload")).toBe(true);
  });
});

describe("workflow execution", () => {
  it("executes the seeded workflow and records node outputs", async () => {
    const run = await executeWorkflow(
      {
        workflowId: "product-marketing-kit",
        scope: "full",
      },
      {
        graph: sampleWorkflowGraph,
        scope: "full",
        userId: "dev-user",
        workflowId: "product-marketing-kit",
        geminiApiKey: "test-gemini-key",
      },
    );

    expect(run.status).toBe("success");
    expect(run.nodes.some((node) => node.nodeId === "llm-converge" && node.outputs?.kind === "text")).toBe(true);
  });
});
