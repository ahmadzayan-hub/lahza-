# Changelog

## v0.9.0 — Typography, dashes-out, and three more features

- Distinct font pair: **Space Grotesk** (Latin) + **IBM Plex Sans Arabic** (Arabic) + **JetBrains Mono** (code/output), all loaded via `next/font/google`.
- Removed every em-dash, en-dash and decorative AI symbol (`✦ ✨ ★ ⚡`) from user-facing strings.
- Arabic refined further for native MSA register and proper punctuation.
- **Token estimator + cost hint** on the textarea.
- **Pin to library** button on the final prompt, with `pinned-prompts` store (up to 200).
- **Auto-save draft** to localStorage every 500 ms so a refresh never loses work.
- 62 / 62 tests pass (added 10 for the new modules); typecheck clean; build green; all 6 routes 200.

## v0.8.0 — Prompt Engineering Intelligence

- 🧠 **8 prompt methods** with a selector: Auto (recommends best), CRAFT, Task, Role, Zero-shot, Few-shot, Chain, Structured, Critique. Each method has a dedicated builder and shows description + best-for hint.
- 📊 **Quality Score (0–100)** across 10 dimensions: clarity, context, role, audience, format, tone, constraints, examples, source grounding, validation. Color-coded card with per-dimension bars, strengths, weaknesses, and actionable recommendations.
- 🔀 **Method Comparison** panel: same task built five ways (CRAFT, Structured, Few-Shot, Chain, Task), each scored, tap to view + copy.
- 📥 **Export** — download the final prompt as `.md` or `.txt`.
- 📜 **Local history** — last 50 sessions persist in localStorage with no auth required.
- 📈 **Mini dashboard** on /history: total prompts, average quality, last 7 days, top method.
- 🌙 **Dark mode** — header toggle, persists, respects OS preference, full UI coverage.
- ⌨️ **Keyboard shortcut** — Cmd/Ctrl+Enter in the textarea to generate.
- 🇦🇪 **Arabic refined** — every visible string rewritten for native UAE/Gulf professional MSA tone; proper diacritics where they aid comprehension; no machine-translation artefacts.
- 🛡️ **Privacy cleanup** — removed personal/account references from source.
- ✅ **42/42 tests pass** across 7 files; typecheck clean; production build green; all 6 routes return 200.

## v0.7.0 — Prismly (rebrand + motion)

- 🌈 **Rebrand** to **Prismly** (EN) / **منشور** (AR). A prism refracts a raw idea into a structured spectrum of prompt sections — the brand metaphor now matches what the product actually does.
- 🎨 **New logo**: literal prism with an incoming white ray and a refracted red→violet spectrum. Used as the PWA icon and inline header logo.
- 🪄 **Interactive motion**:
  - Floating logo on the homepage (`po-float` 4s loop)
  - Spectrum-animated pill text (`po-spectrum`)
  - Shimmer sweep on the primary CTA (`po-shimmer`)
  - Lift + icon rotate on step-card hover
  - Sliding gradient on `.btn-primary` hover
  - Soft pulse for active accents (`po-pulse-soft`)
- ♿ All motion respects `prefers-reduced-motion`.
- 📄 New `docs/AUDIT.md` — design + code audit with what's fixed, what's watched, what's deferred.

## v0.6.0 — Operational

- 🎤 Voice recording now keeps listening until the user manually stops. Auto-restarts past the browser's silence cutoff. Live elapsed-time counter (mm:ss) shown while recording.
- 🧹 Removed the "Try a starter" chips from the workspace — clutter without much value. Templates page is the new home for starters.
- 📐 Responsive workspace redesign: single column on mobile, two columns + sticky help/status side panel on desktop. Bigger textarea (`min-h-[180px]` mobile / `220px` desktop, resizable). All controls grouped below.
- 📎 File upload now accepts every file type — images (with thumbnail), audio, video, PDFs, binary. New thumbnail grid with type-specific icons; image dimensions and audio/video duration extracted client-side.
- 📋 Templates page hardened: never calls the API for primary rendering; the built-in catalog always ships, the API is best-effort and silently merges.
- 🧊 Service worker cache key bumped to `po-shell-v6` so old phone caches (which still showed the old 500 banner) are invalidated on next load.
- 📚 New `docs/OPERATIONAL.md` — pre-launch checklist, smoke test, runbook, deferred items.
- ✅ 18/18 tests · typecheck · production build all green.

## v0.5.0

- Killed `/templates` 500 with built-in catalog of 9 curated templates (EN+AR).
- Voice prompt (Web Speech API).
- Structured + unstructured file upload, merged into prompt context.
- Refined Arabic phrasing with proper diacritics.

## v0.4.0

- Supabase publishable-key support.
- Session-refresh middleware on every request.
- `utils/supabase/{server,client,middleware}.ts` modules.

## v0.3.0 — 2026-05-01

The "it works on my phone" release.

- ✅ Bug fix: client-side `Failed to execute 'json' on 'Response'` is gone (safeFetch wrapper + handles empty/non-JSON bodies).
- 🌍 Multilingual: full English + Arabic dictionaries, `<html dir="rtl">` switching, language toggle persisted in cookie + localStorage, RTL-safe layouts using logical properties.
- 📱 Mobile: PWA manifest + service worker (installable on Android), responsive header with hamburger menu, Capacitor scaffold for a true `.apk`.
- 🛠 Local engine: full client-side prompt orchestration — intent detection (EN+AR), question generation, model-specific reconstruction (ChatGPT, Claude, Copilot, Gemini, generic). Workspace falls back to local engine on any backend failure, so the app *always* produces a result.
- 🎨 Brand mark: prompt-cursor + spark logo on a brand→violet→pink gradient.
- ✨ Visual aids: hero illustration (raw note → spark → polished card), line-art step icons (Pen, Chat, Sparkle), coloured intent badges, decorative corner sparks.
- ✅ Quality: 18 vitest tests, typecheck and production build clean.

Tag: `v0.3.0` (local, on commit `526fa8c`).

## v0.2.0

- Vitest harness with 18 unit tests across 4 service modules.
- Quick-enhance mode (skip clarifications).
- Six starter prompts on workspace, before/after compare panel, history search.
- Gemini target_model end-to-end, graceful LLM-unreachable 503.

## v0.1.0

- Initial multi-tenant SaaS scaffold: Next.js + Supabase + Ollama + Vercel.
- Browser extension (MV3) for ChatGPT / Claude / Copilot / Gemini.
- Self-contained interactive demo at `/demo.html`.
