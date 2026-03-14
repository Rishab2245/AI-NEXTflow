export const triggerTasks = {
  llm: "run-llm-node",
  cropImage: "crop-image-node",
  extractFrame: "extract-frame-node",
} as const;

export function triggerDevEnabled() {
  return Boolean(process.env.TRIGGER_SECRET_KEY && process.env.TRIGGER_API_URL);
}

export async function invokeTriggerTask<TPayload, TResult>(
  taskId: string,
  payload: TPayload,
  fallback: (payload: TPayload) => Promise<TResult>,
) {
  if (!triggerDevEnabled()) {
    return fallback(payload);
  }

  return fallback(payload);
}
