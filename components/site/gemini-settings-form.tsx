"use client";

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type KeyStatus = {
  configured: boolean;
  maskedKey: string | null;
};

export function GeminiSettingsForm() {
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [status, setStatus] = useState<KeyStatus>({ configured: false, maskedKey: null });
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      const response = await fetch("/api/user/secrets", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        setLoading(false);
        setNotice("Could not load current Gemini key status.");
        return;
      }

      const payload = (await response.json()) as KeyStatus;
      setStatus(payload);
      setLoading(false);
    };

    void loadStatus();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("");

    const response = await fetch("/api/user/secrets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ geminiApiKey }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; error?: string }
      | null;

    if (!response.ok) {
      setSaving(false);
      setNotice(payload?.error ?? "Unable to save Gemini key.");
      return;
    }

    const refreshed = await fetch("/api/user/secrets", {
      method: "GET",
      cache: "no-store",
    });

    if (refreshed.ok) {
      const refreshedStatus = (await refreshed.json()) as KeyStatus;
      setStatus(refreshedStatus);
    }

    setGeminiApiKey("");
    setSaving(false);
    setNotice("Gemini key saved. You can now run workflows.");
  }

  return (
    <section className="rounded-[28px] border border-black/10 bg-white/75 p-6 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.24)]">
      <p className="text-[10px] uppercase tracking-[0.24em] text-[#7f6e5a]">Model credentials</p>
      <h1 className="mt-2 text-2xl font-semibold text-[#11110f]">Gemini API key</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#5e564c]">
        Workflow runs are blocked until a Gemini key is configured for your account. The key is encrypted at rest and
        only used on the server while executing LLM nodes.
      </p>

      <div className="mt-4 rounded-2xl border border-black/10 bg-[#f7f1e7] px-4 py-3 text-xs text-[#40392f]">
        {loading
          ? "Checking key status..."
          : status.configured
            ? `Configured: ${status.maskedKey ?? "saved"}`
            : "No Gemini API key configured yet."}
      </div>

      <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
        <label className="text-xs font-medium text-[#40392f]" htmlFor="gemini-key-input">
          Enter Gemini API key
        </label>
        <Input
          id="gemini-key-input"
          type="password"
          value={geminiApiKey}
          onChange={(event) => setGeminiApiKey(event.target.value)}
          placeholder="AIza..."
          autoComplete="off"
          className="h-11 border-black/15 bg-white text-sm text-[#11110f] placeholder:text-[#8c7f70] focus:border-[#0d4a46]"
          required
        />
        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" disabled={saving || geminiApiKey.trim().length === 0}>
            {saving ? "Saving..." : "Save key"}
          </Button>
          {notice ? <p className="text-xs text-[#5e564c]">{notice}</p> : null}
        </div>
      </form>
    </section>
  );
}
