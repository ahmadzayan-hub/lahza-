# Prompt Orchestrator

A 100% free, multi-tenant SaaS that turns rough user ideas into polished,
model-aware prompts. Built on **Next.js + Supabase + Ollama + Vercel** —
zero hosting, database, and AI fees.

## Features

- Raw prompt intake with intent detection
- Rule + LLM gap analysis → clarification questions
- Multi-step Q&A session state
- Final prompt reconstruction with rationale
- Model-specific formatting for ChatGPT, Claude, Copilot, generic
- Prompt history + versioning
- Multi-tenant orgs with Postgres Row-Level Security
- Chrome (Manifest V3) browser extension that injects into ChatGPT, Claude,
  Copilot, and Gemini

## Folder structure

```
.
├── extension/                  Chrome MV3 extension
│   ├── manifest.json
│   ├── background.js           service worker
│   ├── content.js / content.css inject Enhance button
│   ├── popup.html / popup.js / popup.css
│   └── options.html / options.js
├── supabase/
│   ├── migrations/0001_init.sql full schema + RLS
│   └── seed.sql                public templates
├── src/
│   ├── app/                    Next.js App Router
│   │   ├── layout.tsx, page.tsx, globals.css
│   │   ├── login/page.tsx
│   │   ├── workspace/page.tsx
│   │   ├── templates/page.tsx
│   │   ├── history/page.tsx
│   │   └── api/
│   │       ├── health/
│   │       ├── orgs/
│   │       ├── templates/[id]/
│   │       ├── sessions/[id]/answers/
│   │       ├── sessions/[id]/finalize/
│   │       └── extension/enhance/
│   ├── components/
│   │   └── Workspace.tsx
│   └── lib/
│       ├── env.ts, types.ts
│       ├── supabase/{server,browser}.ts
│       ├── llm/{ollama,prompts}.ts
│       └── services/{orchestration,clarification,template,formatter,auth}.ts
├── package.json, tsconfig.json, next.config.mjs
├── tailwind.config.ts, postcss.config.mjs
└── docs/
    ├── API.md
    └── DEPLOY.md
```

## Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, and OLLAMA_BASE_URL.

# 3. Run Ollama (in another terminal)
ollama pull llama3
ollama pull mistral
ollama pull phi3
ollama serve

# 4. Apply Supabase schema
#   psql "$SUPABASE_DB_URL" -f supabase/migrations/0001_init.sql
# (or paste it into the Supabase SQL editor)

# 5. Start the app
npm run dev
# open http://localhost:3000
```

## Browser extension

```bash
# Chrome → chrome://extensions → Developer mode → "Load unpacked"
# select the ./extension folder.
# Then open the extension Options page and set:
#   API base URL = your Vercel/localhost URL
#   API key      = the EXTENSION_API_KEY value from .env.local
```

See [docs/API.md](docs/API.md) and [docs/DEPLOY.md](docs/DEPLOY.md).
