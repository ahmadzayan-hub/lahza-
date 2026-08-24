# Branch review — `lint-setup` (project-migration leftovers)

**Date:** 2026-08-23 · **Domain:** system · **Reviewed by:** agent session
`claude/branch-review-project-migration-k0yx56` · **Status of `lint-setup`:**
never merged, 6 commits, 2 commits behind `main` at review time.

After the workspace hygiene pass that moved every stale branch under
`archive/*`, exactly one live branch besides `main` remained: `lint-setup`.
This review dispositions each artifact on it.

## Verdict per artifact

| Artifact | Verdict | Rationale |
| --- | --- | --- |
| `MIGRATION_PLAN.md` | **Obsolete — do not merge** | Plans the split of the old `desktop-tutorial` repo into 6 per-project repos. That split was **executed**: this repository (`lahza-Private`) is itself one of its outputs, and every "canonical branch" the plan references (`beyond-connect-console`, `legacy/prompt-orchestrator`, `draftly/main`, `pitchora`, `mutabasir/director-lens-platform`) now lives under `archive/*` here. Historical record only. |
| `migrate.sh` / `migrate.ps1` | **Obsolete — do not merge** | Hardcoded to abort unless `origin` is `desktop-tutorial`, which no longer exists under that name. The final commits on the branch ("retarget scripts at the `-Private` named repos") were the last step before execution. Spent one-time tooling. |
| `eslint.config.mjs` + `package.json` lint changes | **Ported to this branch (updated)** | Still valuable and still missing from `main`: `main`'s `lint` script invoked ESLint with legacy `--ext` flags, **no config file and no eslint devDependency**, so `npm run lint` failed on `main`. Ported forward with one update: `beyond-style-uae/**` added to the ignore list (the storefront landed on `main` via PR #60 *after* the branch was cut, and ships its own lint story). |

## Verification (this branch, fresh install)

- `npm install` — clean (ESLint 10.9.0 resolved via `typescript-eslint` peer).
- `npm run lint` — passes, zero warnings.
- `npm run typecheck` — passes.
- `npm run build` — passes (`vite build` ✓).

## Recommended follow-up (owner action — not performed here)

Branch deletion/rename on origin is a destructive external action
(Checkpoint D), so it is left to the owner: once this branch merges, move
`lint-setup` to `archive/lint-setup` (or delete it) via the GitHub UI. Its
full history — including `MIGRATION_PLAN.md` and the migrate scripts — stays
reachable in git either way; nothing needs copying into `main`'s tree.

After that, `main` is the only live long-lived branch, and the
project-migration effort is fully closed out.
