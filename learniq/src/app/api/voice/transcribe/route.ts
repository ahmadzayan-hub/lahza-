export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/voice/transcribe
 *
 * Accepts a multipart/form-data body with:
 *   - audio: Blob  (webm, mp4, ogg, wav, m4a — whatever MediaRecorder produced)
 *   - language?: string  (e.g. "ar", "en" — passed to Whisper for accuracy)
 *
 * Returns: { transcript: string }
 *
 * Uses OpenAI Whisper (whisper-1). Falls back to a clear error JSON so the
 * client can surface it rather than crashing with an opaque network error.
 */
export async function POST(req: NextRequest) {
  // ── 1. Parse multipart ──────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form_data" }, { status: 400 });
  }

  const audioEntry = formData.get("audio");
  if (!audioEntry || typeof audioEntry === "string") {
    return NextResponse.json({ error: "missing_audio_blob" }, { status: 400 });
  }
  const audioBlob = audioEntry as Blob;

  // Minimum sanity: reject obviously empty uploads
  if (audioBlob.size < 1000) {
    return NextResponse.json({ error: "audio_too_short", transcript: "" }, { status: 200 });
  }

  const language = (formData.get("language") as string | null) ?? undefined;

  // ── 2. Validate API key ─────────────────────────────────────────
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "openai_key_missing", transcript: "" },
      { status: 503 }
    );
  }

  // ── 3. Build the Whisper request ────────────────────────────────
  // Whisper expects the file to have a recognisable extension in its name
  // so it can detect the codec. MediaRecorder typically produces webm or mp4.
  const mimeType = audioBlob.type || "audio/webm";
  const ext = mimeType.includes("mp4") ? "mp4"
            : mimeType.includes("ogg") ? "ogg"
            : mimeType.includes("wav") ? "wav"
            : mimeType.includes("m4a") ? "m4a"
            : "webm";

  const whisperForm = new FormData();
  whisperForm.append("file", audioBlob, `recording.${ext}`);
  whisperForm.append("model", "whisper-1");
  whisperForm.append("response_format", "json");
  if (language) whisperForm.append("language", language);

  // ── 4. Call Whisper ─────────────────────────────────────────────
  let whisperRes: Response;
  try {
    whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: whisperForm,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "whisper_network_error", detail: String(e), transcript: "" },
      { status: 502 }
    );
  }

  if (!whisperRes.ok) {
    const body = await whisperRes.text().catch(() => "");
    return NextResponse.json(
      { error: "whisper_api_error", status: whisperRes.status, detail: body, transcript: "" },
      { status: 502 }
    );
  }

  const data = await whisperRes.json() as { text?: string };
  const transcript = (data.text ?? "").trim();

  return NextResponse.json({ transcript });
}
