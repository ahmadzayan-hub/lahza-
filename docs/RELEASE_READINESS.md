# Prismly · Final Release Readiness

**Version:** v0.9.0
**Verdict:** Ready for public trial release.

## What this is

A multilingual (English + Arabic) AI prompt-engineering platform that turns vague ideas into structured, model-aware prompts. Eight prompt methods (CRAFT, Task, Role, Zero-shot, Few-shot, Chain, Structured, Critique) plus an Auto-recommender. Works offline thanks to a built-in rule-based engine; uses OpenAI for higher-quality cloud reconstruction when a key is configured.

## Quality gate (this build)

| Check | Result |
|---|---|
| Unit tests | **62 / 62 pass** across 11 files |
| TypeScript strict | clean |
| Production build | green (13 routes + middleware 80.8 kB) |
| Live route smoke | `/`, `/workspace`, `/templates`, `/history`, `/login`, `/demo.html` all **200** |
| `/api/health` | `{"status":"ok","service":"prismly"}` |
| Privacy audit | no personal references, no leaked API keys, no `OPENAI_API_KEY` / `sk-proj` / `gpt-4o` in client bundle |
| Visual symbols | no decorative AI symbols (✦ ✨ ★) and no em/en dashes in user-facing strings |
| Arabic typography | IBM Plex Sans Arabic loaded via `next/font`, proper RTL, native MSA wording |

## What ships in v0.9.0

### Core experience
- Workspace with raw text + voice input + file upload (all file types)
- 8 prompt methods + Auto recommend
- Live quality score (0 to 100) across 10 dimensions
- Method comparison panel (5 methods side by side)
- Before / After view with token estimate
- Final-prompt export (.md, .txt)
- Pin to library (new in v0.9)
- Auto-save draft to localStorage (new in v0.9)
- Token estimator with cost hint (new in v0.9)
- Keyboard shortcut: Cmd/Ctrl + Enter

### Backend
- Three-layer LLM dispatcher: OpenAI when key present, else Ollama, else local engine
- Server-only API key handling (verified absent from client bundle)
- Per-process daily call cap (default 500, configurable)
- Supabase session refresh middleware

### Internationalisation
- English and Arabic dictionaries (native MSA, professional UAE/Gulf register)
- RTL layout switching with `html[dir="rtl"]`
- Distinct Arabic font (IBM Plex Sans Arabic)
- All user-visible strings free of decorative symbols and em-dashes

### Design
- Distinct font pair: **Space Grotesk** for Latin, **IBM Plex Sans Arabic** for Arabic, **JetBrains Mono** for prompt code blocks
- Light + dark themes (persists, respects OS preference)
- Brand mark: prism logo (white ray refracting into a colour spectrum)
- Subtle motion: floating logo, spectrum-text pill, button shimmer; honours `prefers-reduced-motion`
- Responsive: single-column mobile, two-column desktop with sticky side panel

### Persistence
- Local history (last 50 sessions in localStorage, no auth required)
- Pinned library (up to 200 entries)
- Mini dashboard on /history: total, average quality, last 7 days, top method

### PWA
- Installable on Android and iOS (Add to Home Screen)
- Service worker (`po-shell-v6`) caches the app shell
- Capacitor scaffold ready in `mobile/` for a Play Store APK

## Known limitations
| Item | Why deferred |
|---|---|
| PDF / DOCX in-browser text extraction | Needs pdf.js + mammoth.js (~300 KB) |
| Image OCR | Needs tesseract.js (~1 MB) |
| Streaming LLM responses | Requires SSE plumbing |
| Public share links | Needs server-side token route |
| Subscription billing | Stripe + Apple IAP + Google Play Billing not wired |

## Smoke test for a fresh user (10 steps)
1. Open the deploy URL. Landing renders with the prism logo floating gently.
2. Tap **العربية**. Whole interface flips to RTL with native Arabic copy.
3. Open Workspace. Type a prompt of any length. Note the live char/word/token counter.
4. Press **Quick enhance**. Within ~1 second you see the quality score card, the final prompt, and the before/after panel.
5. Click **Pin**. The button turns into "Pinned".
6. Click **Export**. Pick `.md`. File downloads.
7. Tap the mic. Speak a sentence. Tap mic again. The text appears appended to the textarea.
8. Drop an image and a CSV onto Attach files. Both appear as cards.
9. Refresh the browser. Your half-typed prompt is restored from auto-saved draft.
10. Open /history. The session you ran is listed with its quality score, method, and model.

## Deploy steps
1. Vercel → Settings → Git → Production Branch = `claude/prompt-orchestrator-saas-YOoP8`
2. Vercel → Settings → Environment Variables (Production + Preview + Development):
   - `OPENAI_API_KEY` (your rotated key, server only)
   - `OPENAI_MODEL` = `gpt-4o-mini` (recommended)
   - `LLM_DAILY_CALL_LIMIT` = `200` (recommended soft brake)
   - Optionally: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for auth/history sync
3. Set hard monthly cap at https://platform.openai.com/account/limits (e.g. $10)
4. Trigger redeploy
5. Verify at `https://<your-project>.vercel.app/api/health` returns `{"status":"ok","service":"prismly"}`
6. Run the 10-step smoke test above

## Why I cannot give you a working link from here
My environment is a private sandbox container with no public ingress. Only your Vercel deploy serves a public URL. Once you complete the deploy steps above, your public URL will serve this build.
