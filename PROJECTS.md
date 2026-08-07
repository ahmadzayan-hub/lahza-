# Projects in this repository

This repository is a **multi-project workspace**, not a single app. It hosts three
independent product lines. They share no application code — each folder is
self-contained and can be split into its own GitHub repository and deployment
without touching the others.

> Deploy note: Vercel/Netlify pointed at the repo **root** build **Lahza only**
> (the root `vite` app). The sibling folders are ignored by the root build, so
> Lahza already "works separately" today. The other projects each ship their own
> build/deploy config and are extracted as shown below.

## Product line 1 — Lahza (لحظة)

| | |
| --- | --- |
| **Path** | `/` (repository root: `src/`, `public/`, `index.html`) |
| **What** | Bilingual (EN/AR) web app for personalised coffee gifts, event coffee stations and corporate campaigns |
| **Stack** | Vite + React + TypeScript + Tailwind |
| **Deploy** | Vercel or Netlify from the repo root (`vercel.json`, `netlify.toml`) |
| **Standalone** | Yes — builds and deploys from root today |

## Product line 2 — Wisal (وصال) / رسايل القلب

A family-messaging assistant delivered across three surfaces. These are **three
surfaces of one product, not duplicates**: a web landing page, an Android app,
and a Telegram bot.

| Path | Surface | Stack | Deploy target |
| --- | --- | --- | --- |
| `wisal-web/` | Landing + download page | Static HTML/CSS/JS (own `vercel.json`, `manifest`, `sitemap`, `robots`, `llms.txt`) | Vercel/Netlify as a **separate project** with Root Directory = `wisal-web` |
| `android-wife-assistant/` | Android app | Kotlin + Gradle | Google Play / signed APK |
| `telegram-wife-assistant/` | Telegram bot | Node.js (PM2 `ecosystem.config.js`) | Any always-on host (VPS/Render/Railway) via PM2 |

## Product line 3 — Beyond Style UAE (بيوند ستايل)

The Beyond Style jewelry/accessories brand is delivered across **two surfaces —
not duplicates**: a lightweight marketing landing page, and a full e-commerce
storefront. They share no source code and deploy independently.

| Path | Surface | Stack | Deploy target |
| --- | --- | --- | --- |
| `landing/` | Marketing landing page | Static HTML/CSS/JS (no build); ordering via WhatsApp + Google form | **GitHub Pages** via `.github/workflows/deploy-landing.yml`; or any static host |
| `beyond-style-uae/` | Storefront (`beyond-style-boutique`) | Vite + React + TS + Tailwind; Hono API + Drizzle/MySQL; Stripe; installable PWA, full SEO/AIO, RTL Arabic | Vercel as a **separate project**, Root Directory = `beyond-style-uae` (own `vercel.json`) |

The npm/Vercel project name `beyond-style-boutique` is deliberately distinct from
`lahza` and `wisal-web` so nothing collides.

`docs/` holds shared threat models (`THREAT_MODEL.md`, `THREAT_MODEL_WISAL.md`).

## No duplication

There is **no duplicated project or copied application code** in the tree. Lahza
lives only at the root (`src/`); the three Wisal surfaces are distinct
implementations (web / Android / bot) of one product; and the two Beyond Style
surfaces are a static landing (`landing/`) and a separate e-commerce storefront
(`beyond-style-uae/`) — different code, different stacks, no shared source.
Verified: no duplicated source folders across projects.

> Three static "landing"-style folders exist but are **not duplicates**:
> `wisal-web/` markets the Wisal messaging app (with the APK download),
> `landing/` is the Beyond Style marketing page, and `beyond-style-uae/` is the
> Beyond Style transactional storefront. Different products/surfaces, different
> content, different deploy targets.

## Deploy each project separately (no extraction required)

- **Lahza** — import this repo into Vercel/Netlify; Root Directory `.`. Done.
- **wisal-web** — new Vercel/Netlify project from this repo, Root Directory
  `wisal-web` (it has its own `vercel.json`). Fully independent build.
- **telegram-wife-assistant** — `cd telegram-wife-assistant && npm i && pm2 start
  ecosystem.config.js` on any always-on host. Needs `GROQ_API_KEY` +
  `TELEGRAM_BOT_TOKEN` (see its `README.md`).
- **android-wife-assistant** — open in Android Studio, or `./gradlew assembleRelease`.
- **landing (Beyond Style UAE)** — already auto-deploys to GitHub Pages via
  `deploy-landing.yml`; or host the `landing/` folder as-is on any static host.
- **beyond-style-boutique (storefront)** — new Vercel project from this repo,
  Root Directory `beyond-style-uae` (it has its own `vercel.json`). Independent build.

## Split a project into its own GitHub repository (history-preserving)

To move any subfolder into a brand-new repo while keeping its git history:

```bash
# 1. Split the folder into a standalone branch (keeps only its history)
git subtree split --prefix=<folder> -b split-<folder>
#    e.g. --prefix=wisal-web  |  --prefix=telegram-wife-assistant  |  --prefix=landing

# 2. Create an empty new repo on GitHub, then push the split branch as main
git push git@github.com:<you>/<new-repo>.git split-<folder>:main

# 3. In the new repo, that folder's contents are now at the root.
```

For Lahza itself (already the root app), the inverse is simpler: create its repo
from the root and delete the sibling folders **in that copy only** — this
workspace stays intact.
