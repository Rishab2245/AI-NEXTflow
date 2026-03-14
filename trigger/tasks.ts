import { logger } from "@trigger.dev/sdk";

export const workflowTasks = {
  "run-llm-node": async (payload: Record<string, unknown>) => {
    logger.info("Executing run-llm-node task", { payload });
    return payload;
  },
  "crop-image-node": async (payload: Record<string, unknown>) => {
    logger.info("Executing crop-image-node task", { payload });
    return payload;
  },
  "extract-frame-node": async (payload: Record<string, unknown>) => {
    logger.info("Executing extract-frame-node task", { payload });
    return payload;
  },
};
