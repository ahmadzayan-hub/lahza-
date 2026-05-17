# Agent setup

Notes for Claude Code (and other agentic tools) operating on this repo.

## MCP servers configured

This project ships with `.mcp.json` declaring the **Supabase MCP server**
(scope: project). When you open this repo in Claude Code, the server is
listed under `claude /mcp`. You must authenticate **once** per machine.

### First-time authentication (your machine, not the agent's sandbox)

```bash
# in a regular terminal, inside this project root
claude /mcp
# select 'supabase'
# select 'Authenticate'
# complete the browser OAuth flow with your Supabase account
```

After that, Claude Code (and any agent session in this project) will
have access to Supabase MCP tools such as:

- inspecting tables and RLS policies
- running read-only SQL
- managing migrations
- listing edge functions

OAuth tokens are stored in your local Claude Code keychain, not in
this repository. They are never committed.

## Why `project_ref` is in `.mcp.json`

`project_ref=borurrzvunlzdnxiossh` is the project identifier that already
appears in the public Supabase project URL
(`https://borurrzvunlzdnxiossh.supabase.co`). It is not a secret on its
own — accessing the project still requires a successful OAuth flow.

## Optional: install Supabase agent skills

```bash
# in this project root, on your local machine
npx skills add supabase/agent-skills
```

This drops curated guidance, prompts, and helper scripts into
`.claude/skills/supabase/` so agents (including Claude Code) get
high-quality, project-aware instructions when working with Supabase.

## Environment variables (server-only)

Set these in your local `.env.local` and in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://borurrzvunlzdnxiossh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
SUPABASE_SERVICE_ROLE_KEY=…          # server only, never NEXT_PUBLIC_
OPENAI_API_KEY=…                     # server only
OPENAI_MODEL=gpt-4o-mini
LLM_DAILY_CALL_LIMIT=200
```

The Prismly platform still works **without any of these** thanks to its
built-in local engine; the keys only enable cloud-quality reconstruction
and cross-device session sync.

## How to start a fresh agent session safely

1. Pull latest on the `claude/prompt-orchestrator-saas-YOoP8` branch.
2. Open the project in Claude Code.
3. Trust the project MCP servers when prompted (one-time).
4. Run `claude /mcp` and authenticate Supabase if you haven't yet.
5. Ask the agent to read `CHANGELOG.md` and `docs/RELEASE_READINESS.md`
   first so it has full context.
