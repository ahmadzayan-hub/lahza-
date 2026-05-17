# desktop-tutorial — monorepo

Five independent projects live in this repository. Each one has its own
named directory, its own `package.json` (where applicable), its own
build / deploy config, and its own `vercel.json` if it ships to Vercel.
**No project imports code from another.**

| Directory | Project | Stack | Deploy target |
|-----------|---------|-------|---------------|
| [`prompt-orchestrator/`](./prompt-orchestrator/README.md) | Prompt Orchestrator | Next.js 14 + Supabase + Ollama | Vercel |
| [`vertex-platform/`](./vertex-platform/README.md) | VERTEX — Contract & Project Intelligence | Vite + React + Supabase | Vercel (separate project) |
| [`zaian-studio-extension/`](./zaian-studio-extension/README.md) | ZAIan Studio — Chrome MV3 extension | Vanilla JS / MV3 | Chrome Web Store |
| [`zaian-studio-desktop/`](./zaian-studio-desktop/) | ZAIan Studio — Desktop wrapper | Electron 31 | electron-builder artifacts |
| [`zaian-studio-mobile/`](./zaian-studio-mobile/README.md) | ZAIan Studio — Mobile shell | Capacitor 6 (iOS + Android) | App Store / Play Store |

## Working in this monorepo

Each project is fully self-contained. Run all commands from inside the
project's directory:

```bash
# Prompt Orchestrator (web)
cd prompt-orchestrator && npm install && npm run dev

# VERTEX
cd vertex-platform && npm install && npm run dev

# ZAIan Studio — Chrome extension
# load zaian-studio-extension/ via chrome://extensions → Load unpacked

# ZAIan Studio — Desktop
cd zaian-studio-desktop && npm install && npm start

# ZAIan Studio — Mobile
cd zaian-studio-mobile && npm install && npm run android:open
```

## Deployment isolation

Each Vercel-deployable project has its own `vercel.json` with a scoped
`ignoreCommand`, so a commit that only touches one project never
triggers a build of any other. Branches that match `claude/vertex-*` or
`vertex/*` are hard-skipped by every project **except** `vertex-platform`
— that's the explicit boundary between VERTEX and the rest of the
monorepo.

**On Vercel, each project must be set up as a separate Vercel project
with its own Root Directory:**

| Vercel project | Root Directory | Framework |
|----------------|----------------|-----------|
| prompt-orchestrator | `prompt-orchestrator` | Next.js |
| vertex-platform | `vertex-platform` | Vite |

The Electron, Capacitor, and Chrome-extension projects do not ship to
Vercel; they build native / browser-store artifacts locally.

## Git branch policy

| Branch pattern | Intended scope |
|----------------|----------------|
| `main` | Production for every project |
| `claude/vertex-*`, `vertex/*` | VERTEX-only work; root project skips builds |
| Other feature branches | Any project; only the project whose files changed will rebuild |

## Adding a new project

1. Create a top-level directory named after the project (kebab-case).
2. Add its own `package.json` (or platform manifest), `README.md`, and
   build config.
3. If it deploys to Vercel: add a `vercel.json` with an `ignoreCommand`
   that exits 0 when the project's own files weren't touched.
4. Register the project in the table at the top of this README.
5. In Vercel UI: create a separate Vercel project pointing at the new
   directory with Root Directory set.

## Why a monorepo

The web (Prompt Orchestrator) and its platform variants (extension,
desktop, mobile) share a product story and a brand (ZAIan Studio) but
have different build systems and stores. Keeping them together makes
cross-platform releases coordinated; per-project Root Directories and
`ignoreCommand`s keep CI cleanly scoped.
