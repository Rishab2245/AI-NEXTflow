import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUserId } from "@/lib/server/auth";
import { getUserGeminiApiKeyStatus, setUserGeminiApiKey } from "@/lib/server/storage";

const secretSchema = z.object({
  geminiApiKey: z.string().trim().min(20, "Gemini API key looks too short."),
});

export async function GET() {
  const userId = await requireUserId();
  const status = await getUserGeminiApiKeyStatus(userId);
  return NextResponse.json(status);
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  const parsed = secretSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid Gemini API key." }, { status: 400 });
  }

  try {
    await setUserGeminiApiKey(userId, parsed.data.geminiApiKey);
  } catch (error) {
    if (error instanceof Error && error.message.includes("GEMINI_KEY_ENCRYPTION_SECRET")) {
      return NextResponse.json(
        { error: "Server missing GEMINI_KEY_ENCRYPTION_SECRET configuration." },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: "Unable to save Gemini key." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
