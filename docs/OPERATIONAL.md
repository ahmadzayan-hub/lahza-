# Operational Readiness — v0.6.0

Honest pre-launch checklist for moving from "demo working on my phone" to
"users can rely on it daily."

## ✅ Ready

| Area | Status | Why |
|---|---|---|
| Core flow (raw → questions → final prompt) | Ready | Works end-to-end, EN + AR, with or without backend |
| Offline / no-Supabase fallback | Ready | Local engine produces structured prompts in both languages |
| Multilingual UI | Ready | Full EN + AR translations, RTL layout, locale persisted |
| Voice prompt | Ready | Persistent listening, auto-restarts past browser silence cutoff |
| File attachments | Ready | All file types accepted (text, image, audio, video, binary, structured) |
| PWA install on Android | Ready | Manifest + service worker (cache version bumped each release) |
| Responsive layout | Ready | Single column on mobile, two columns + side panel on desktop |
| Build & types | Ready | 18/18 tests, typecheck, production build all green |
| Supabase session refresh | Ready | Middleware (`ƒ Middleware 80.8 kB`) calls `getUser()` on every request |
| Branded logo + visual aids | Ready | Cursor + spark mark, hero illustration, line-art icons |

## ⚠ Limitations (worth telling users)

| Item | Impact | Workaround in product |
|---|---|---|
| Server-side LLM enhance only works with Ollama reachable from Vercel | Cloud reconstruction unavailable on free tier | Local engine kicks in automatically; user sees "Running locally" banner |
| File content for PDF/audio/video isn't extracted in-browser | Engine can't read inside non-text files | Prompt embeds metadata + a placeholder so the user sends the actual file to ChatGPT/Claude |
| Voice recognition is browser-native (Web Speech API) | iOS Safari & some Android browsers may not support it, or accuracy varies for Arabic dialects | `🎤 —` placeholder shown when unsupported, no error |
| Sessions/history require Supabase login | Anonymous users see "No sessions yet" | Workspace itself works without login; we show this clearly |
| 25 MB hard cap per file | Large datasets/videos refuse | Error message in user's language with the limit |

## 🧪 Smoke test (every release)

Run on a fresh phone with no cookies:

1. Open the Vercel URL → landing renders, gradient logo visible.
2. Tap **العربية** → page mirrors RTL, all copy translates.
3. **Workspace**:
   - Type a prompt → Quick enhance → final prompt appears with sections.
   - Tap mic → speak Arabic → text appears in textarea → tap mic → stops cleanly.
   - Attach an image, a CSV, and a PDF → all show as chips with previews; image gets a thumbnail.
   - Generate final prompt → "## Attached data" block appears in the output.
4. **Templates** → cards render (no 500), tap one → workspace pre-filled with that template's starter.
5. **History** → empty state ("No sessions yet") shown without errors.

## 🚀 Operational runbook

| Question | Where to look |
|---|---|
| User reports "Request failed (500)" | Their browser is on a stale SW cache. Have them hard-refresh; SW cache key bumps to `po-shell-v6` after this release |
| `/api/sessions` returns 503 | Ollama is unreachable. Workspace falls back to local automatically — only visible if user is signed in and watching network logs |
| `/api/sessions` returns 401 | Cookies / Supabase env in Vercel. Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Build fails on Vercel | `env.ts` is now lazy — build never reads env. If you see a failure, it's a TypeScript error; run `npm run typecheck` locally |
| Mic doesn't work | Browser doesn't support `SpeechRecognition`. Voice button shows `🎤 —` instead of erroring. iOS Safari is the main offender |

## 🔮 Deferred to v0.7+

These are real customer needs but not blocking v0.6 ship:

- In-browser PDF / DOCX text extraction (pdf.js + mammoth.js — adds ~300 KB)
- Image OCR for screenshots (tesseract.js — 1 MB+)
- Streaming LLM reconstruction so the prompt builds visibly
- Public share links for finalized prompts
- Per-IP rate limiting on `/api/extension/enhance`
- Native Android app via Capacitor (scaffold ships in `mobile/`, needs an `npm run android:init` on a machine with Android Studio)
- Custom keyboard / IME for Grammarly-style writing assistance system-wide

## ✅ Operational verdict

The product is **ready for early users**:
- The workspace cannot leave the user empty-handed (local fallback).
- The templates page no longer 500s (built-in catalog ships with the app).
- The mobile and desktop experiences are both first-class.
- Arabic is correct and natural, not Google-translated.
