"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n, useT } from "@/lib/i18n/I18nProvider";

export type FileKind = "structured" | "unstructured" | "image" | "audio" | "video" | "binary";

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  kind: FileKind;
  /** Raw text for text-based files (truncated to MAX_TEXT_BYTES). */
  text?: string;
  /** Object URL for image/audio/video previews. Must be revoked on remove. */
  previewUrl?: string;
  /** Image dimensions (only for images, when available). */
  width?: number;
  height?: number;
  /** Duration in seconds (for audio/video, when available). */
  durationSec?: number;
}

const MAX_TEXT_BYTES = 200 * 1024; // text file content cap
const MAX_FILE_BYTES = 25 * 1024 * 1024; // hard cap so we don't OOM the page (25 MB)

const STRUCTURED_EXT = /\.(csv|tsv|json|jsonl|xml|yaml|yml|toml)$/i;
const TEXT_LIKE = /\.(txt|md|markdown|html|css|js|jsx|ts|tsx|py|rb|go|java|c|cpp|sql|sh|env|log|csv|tsv|json|jsonl|xml|yaml|yml|toml)$/i;

interface Props {
  files: AttachedFile[];
  onChange: (files: AttachedFile[]) => void;
  className?: string;
}

export default function FileUpload({ files, onChange, className }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Revoke object URLs on unmount or when files change
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function inferKind(file: File): FileKind {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type.startsWith("video/")) return "video";
    if (STRUCTURED_EXT.test(file.name)) return "structured";
    if (file.type.startsWith("text/") || TEXT_LIKE.test(file.name)) return "unstructured";
    return "binary";
  }

  async function readImageDimensions(url: string): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  async function readMediaDuration(url: string, kind: "audio" | "video"): Promise<number | null> {
    return new Promise((resolve) => {
      const el = document.createElement(kind);
      el.preload = "metadata";
      el.onloadedmetadata = () => resolve(Number.isFinite(el.duration) ? el.duration : null);
      el.onerror = () => resolve(null);
      el.src = url;
    });
  }

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setError(null);
    setBusy(true);

    const next: AttachedFile[] = [...files];
    try {
      for (const f of Array.from(list)) {
        if (f.size > MAX_FILE_BYTES) {
          setError(
            locale === "ar"
              ? `${f.name} كبير جدًا (الحدّ 25 ميجابايت).`
              : `${f.name} is too large (max 25 MB).`
          );
          continue;
        }

        const id = `${f.name}-${f.lastModified}-${Math.random().toString(36).slice(2, 7)}`;
        const kind = inferKind(f);
        const entry: AttachedFile = { id, name: f.name, size: f.size, type: f.type, kind };

        if (kind === "structured" || kind === "unstructured") {
          const text = await f.text();
          entry.text = text.slice(0, MAX_TEXT_BYTES);
        } else if (kind === "image") {
          const url = URL.createObjectURL(f);
          entry.previewUrl = url;
          const dim = await readImageDimensions(url);
          if (dim) {
            entry.width = dim.width;
            entry.height = dim.height;
          }
        } else if (kind === "audio" || kind === "video") {
          const url = URL.createObjectURL(f);
          entry.previewUrl = url;
          const dur = await readMediaDuration(url, kind);
          if (dur !== null) entry.durationSec = dur;
        } else {
          // binary — no preview, just metadata
        }

        next.push(entry);
      }
      onChange(next);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(id: string) {
    const target = files.find((f) => f.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    onChange(files.filter((f) => f.id !== id));
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-xs text-slate-500">
          {locale === "ar"
            ? "أرفق أي ملف (نصوص، صور، صوت، فيديو، PDF، كود…)"
            : "Attach any file (text, images, audio, video, PDFs, code…)"}
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="btn-ghost border border-slate-300 text-xs"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {busy ? (locale === "ar" ? "جارٍ التحميل…" : "Loading…") : t("files.add")}
        </button>
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          // accept anything; we sort it client-side
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="relative group rounded-lg border border-slate-200 bg-white overflow-hidden hover:shadow-sm transition"
              title={`${f.kind} · ${f.name}`}
            >
              <FilePreview file={f} />
              <div className="px-2 py-1.5 text-[11px] flex items-center justify-between gap-1">
                <div className="truncate flex-1">
                  <div className="truncate font-medium text-slate-700">{f.name}</div>
                  <div className="text-slate-400 text-[10px]">
                    {kindLabel(f.kind, locale)} · {formatSize(f.size)}
                    {f.width && f.height ? ` · ${f.width}×${f.height}` : ""}
                    {f.durationSec ? ` · ${formatDuration(f.durationSec)}` : ""}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(f.id)}
                  aria-label={t("files.remove")}
                  className="w-5 h-5 rounded-full hover:bg-rose-100 hover:text-rose-700 inline-flex items-center justify-center text-slate-400"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilePreview({ file }: { file: AttachedFile }) {
  if (file.kind === "image" && file.previewUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={file.previewUrl} alt={file.name} className="w-full h-20 object-cover bg-slate-100" />;
  }
  if (file.kind === "video" && file.previewUrl) {
    return <video src={file.previewUrl} className="w-full h-20 object-cover bg-slate-900" muted />;
  }
  if (file.kind === "audio") {
    return (
      <div className="w-full h-20 flex items-center justify-center bg-amber-50 text-amber-700">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      </div>
    );
  }
  if (file.kind === "structured") {
    return (
      <div className="w-full h-20 flex items-center justify-center bg-violet-50 text-violet-700 text-xs font-mono">
        {`{}`}
      </div>
    );
  }
  if (file.kind === "unstructured") {
    return (
      <div className="w-full h-20 flex items-center justify-center bg-sky-50 text-sky-700">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
      </div>
    );
  }
  return (
    <div className="w-full h-20 flex items-center justify-center bg-slate-100 text-slate-500">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
    </div>
  );
}

function kindLabel(k: FileKind, locale: "en" | "ar") {
  const ar: Record<FileKind, string> = {
    structured: "بيانات مهيكلة",
    unstructured: "نصّ",
    image: "صورة",
    audio: "صوت",
    video: "فيديو",
    binary: "ملف"
  };
  const en: Record<FileKind, string> = {
    structured: "structured",
    unstructured: "text",
    image: "image",
    audio: "audio",
    video: "video",
    binary: "file"
  };
  return locale === "ar" ? ar[k] : en[k];
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

/** Compose all attachments into a single "Attached data" block for the engine. */
export function formatAttachedAsContext(files: AttachedFile[], locale: "en" | "ar"): string {
  if (!files.length) return "";
  const header = locale === "ar" ? "البيانات المُرفقة" : "Attached data";
  const note =
    locale === "ar"
      ? "هذه ملفات أرفقها المستخدم. النصّ منها مدمج هنا. للملفات الأخرى (صور/صوت/فيديو/PDF) يرجى مطالبة المستخدم بمشاركتها مباشرة في النموذج عند التنفيذ."
      : "These are files the user attached. Text content is embedded inline. For non-text files (images/audio/video/PDF), assume the user will share them directly with the model at runtime.";
  const blocks = files.map((f) => {
    const meta: string[] = [`type: ${f.type || "unknown"}`, `size: ${formatSize(f.size)}`];
    if (f.width && f.height) meta.push(`dimensions: ${f.width}x${f.height}`);
    if (f.durationSec) meta.push(`duration: ${formatDuration(f.durationSec)}`);
    const head = `### ${f.name}\n(${kindLabel(f.kind, locale)} · ${meta.join(" · ")})`;
    if (f.text) {
      return `${head}\n\`\`\`\n${f.text}\n\`\`\``;
    }
    const placeholder =
      locale === "ar"
        ? "_(محتوى الملف غير نصّي. أرسله للنموذج كمرفق منفصل عند التنفيذ.)_"
        : "_(non-text content. Send the actual file to the model alongside this prompt.)_";
    return `${head}\n${placeholder}`;
  });
  return `\n\n## ${header}\n${note}\n\n${blocks.join("\n\n")}`;
}
