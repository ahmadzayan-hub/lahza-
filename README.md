# Draftly · صياغة

> **Every idea deserves a proper draft.**

Draftly is a free, bilingual (English + Arabic), offline-ready SaaS that
turns rough thoughts into structured, model-aware prompts for ChatGPT,
Claude, Copilot or Gemini. Type it, speak it, or attach a file — Draftly
handles the rest.

Built on **Next.js + Supabase + Ollama + Vercel**. Zero hosting, database
or AI fees.

## Features

- Eight prompt engineering methods (CRAFT, Task, Role, Zero-shot,
  Few-shot, Chain of thought, Structured, Critique and improve) with an
  automatic recommender.
- Prompt quality score from 0 to 100 across ten dimensions.
- Side-by-side comparison of five methods on the same idea.
- Voice dictation (English and Arabic) with persistent listening.
- Attach any file — images, PDFs, audio, video, CSV, code.
- Local history and pinned personal library (localStorage, no auth).
- Full English + Arabic UI with proper RTL layout and native MSA copy.
- Distinctive typography: Space Grotesk, IBM Plex Sans Arabic, JetBrains Mono.
- Light and dark themes.
- Installable Progressive Web App for Android, iOS, and desktop.
- Search-engine and AI-answer-engine optimised: robots.txt, sitemap.xml,
  llms.txt, JSON-LD structured data, hreflang.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The local engine works with no backend keys.
Set `OPENAI_API_KEY` in Vercel to enable cloud-quality reconstruction.

## Docs

- `docs/API.md` — API reference
- `docs/DEPLOY.md` — deployment guide
- `docs/MOBILE.md` — installable app + Capacitor
- `docs/RELEASE_READINESS.md` — release checklist
