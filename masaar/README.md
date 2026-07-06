# Masaar

Rail Asset Performance Platform. Bilingual (Arabic + English), mobile-first PWA, offline-capable, single-folder deploy.

## What it is

Masaar takes an annual rail-maintenance plan and turns it into a live decision surface. Users type the monthly numbers, the app computes status, flags gaps, and a built-in operations assistant proposes what to do next. Nothing operational is fabricated: KPI values start empty until a person enters them.

## Live capabilities

- Monthly KPI entry with auto-computed status (on track / watch / off track)
- Project portfolio with filters and search
- Risk register with a likelihood × impact heat map
- Application and environment threat model (STRIDE-aligned), with a live gap scan
- Operations assistant (bring-your-own key) — Groq, Google Gemini, OpenAI, Anthropic, OpenRouter
- Continuous loop mode: agent runs a short status pass every N minutes
- Bilingual EN / AR with proper RTL
- Installable on Android, iOS, and desktop
- Works offline after first visit
- Everything except LLM calls stays on the device

## File layout

```
masaar/
├── index.html            App shell + SEO + JSON-LD
├── manifest.webmanifest  PWA manifest with shortcuts
├── sw.js                 Service worker (stale-while-revalidate)
├── vercel.json           Vercel headers (CSP, HSTS, referrer, framing)
├── robots.txt            Explicitly opts in AI crawlers
├── sitemap.xml           Locale-aware
├── icons/icon.svg        Maskable + any-purpose icon
└── assets/
    ├── logo.svg          Brand mark
    ├── styles.css        Mobile-first, logical properties (RTL-safe)
    ├── i18n.js           Bilingual strings (hand-written)
    ├── data.js           Seed data + threat model + gap detector
    ├── agent.js          Multi-provider LLM client + tools + loop
    └── app.js            App logic, rendering, install, routing
```

## Local run

Any static server:

```
cd masaar
python3 -m http.server 8080
```

Open http://localhost:8080. On the phone, use the "Install app" button that appears when the browser supports it.

## Deploy on Vercel

The `masaar/` folder is a self-contained static project. Point a Vercel project at the folder (Root Directory = `masaar`). No build command is needed; Vercel serves the static files with the headers declared in `vercel.json`.

## Security posture

- Content-Security-Policy with `connect-src` pinned to trusted LLM providers only
- HSTS with preload
- `frame-ancestors 'none'` blocks embedding
- `Referrer-Policy: strict-origin-when-cross-origin`
- API keys held in `sessionStorage` and cleared on tab close; UI shows only the last four characters
- Same-origin-only service-worker cache
- The agent's tool interface asks for explicit confirmation on any state change
- Loop mode enforces a three-minute minimum interval
- A one-tap wipe clears every local store on demand

## Language

Arabic content is written directly, not machine-translated, and uses standard Modern Standard Arabic. Layout uses CSS logical properties (`inset-inline`, `margin-inline`, `padding-inline`) so RTL behaves correctly across every component without duplicated stylesheets.

## Licence

Available for internal evaluation. Contact the maintainer for wider use.
