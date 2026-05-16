# Design + Code Audit (v0.6 → operational)

I went through the codebase as a design auditor. Findings split into
**fixed in this pass**, **shipped but worth watching**, and **deliberately
deferred**.

## ✅ Fixed in this pass

| # | Issue | Resolution |
|---|---|---|
| 1 | Generic name "Prompt Orchestrator" doesn't communicate the value | Rebranded as **Prismly** (EN) / **منشور** (AR) — a prism refracting raw ideas. Logo, manifest, layout title, package name, all dictionaries, hero copy updated. |
| 2 | Hero pill ("100% FREE STACK") felt flat | Added spectrum-animated text `po-spectrum`, floating logo (`po-float`), shimmer sweep on the primary CTA (`po-shimmer`). |
| 3 | Step cards static on hover | Now lift + scale + rotate the icon slightly on hover with a 150ms ease. |
| 4 | Primary button had one solid gradient | Gradient now slides (indigo → violet → pink) on hover via animated `background-position`. |
| 5 | Brand mark was a generic spark | Redesigned as a literal prism: white ray → triangle → coloured spectrum (red → violet). Used in `<Logo />` and as the PWA icon. |
| 6 | Animation could trigger motion sickness | Honoured `prefers-reduced-motion` in `globals.css`. All custom animations disable cleanly when the OS setting is on. |

## ⚠ Shipped, watch in production

| Item | Why it's OK now | When to revisit |
|---|---|---|
| Stale service-worker cache showed the old 500 banner | Cache key bumped to `po-shell-v6`; first reload after deploy invalidates it | If users still see the banner after a hard refresh, bump again |
| `/api/sessions` still uses old `src/lib/supabase/server.ts` | Works correctly; the new `utils/supabase/*` modules are additive | When we migrate to server components reading auth directly |
| The local engine is rule-based, not LLM-backed | Always returns a coherent answer; no Ollama dependency | When Ollama runs reliably on a free tunnel we can stream cloud results |
| Voice recognition is browser-native | Free, works in Chrome/Edge | Add Whisper/WebGPU fallback when we have time |
| 18 unit tests cover the engines, not the UI | Engines are where logic lives; UI is data-driven | Add `@testing-library/react` for Workspace flow tests |

## 🔮 Deliberately deferred

Real customer wants that aren't blockers for v0.6:

- **PDF/DOCX in-browser text extraction** (pdf.js + mammoth — adds ~300 KB)
- **Image OCR** (tesseract.js — 1 MB+)
- **Streaming LLM responses** (SSE scaffolding)
- **Public share links** for finalised prompts
- **Per-IP rate limit** on `/api/extension/enhance`
- **Capacitor Android APK** (scaffold ready in `mobile/`, just needs `npm run android:init`)
- **Dark mode** (only the prism logo is dark-themed today)

## 🧪 Pre-deploy smoke test

A fresh phone with no cookies should pass all of these:

1. **Landing** loads with the prism logo floating gently and the spectrum text animating.
2. **Workspace** accepts a typed prompt, generates clarification questions, and finalises locally — no auth needed.
3. **Mic** starts on tap, keeps listening through silences, stops only on second tap.
4. **File upload** accepts an image (shows thumbnail), a CSV (text), and a PDF (metadata).
5. **العربية toggle** flips the layout to RTL, every visible string translates.
6. **Templates** renders 9 cards (no API call required); tapping one loads the workspace.
7. **History** shows empty state cleanly without 500.

## ✅ Operational verdict

The platform is **ready for early users**:
- The workspace always produces a result (cloud → local fallback).
- The templates page can never 500 (built-in catalog ships with the bundle).
- Voice + file inputs work on Chrome/Edge desktop and Android.
- Mobile, tablet, and desktop layouts all flow.
- Arabic is correct and natural with proper diacritics.
- New brand mark + animations give the app distinct personality.
