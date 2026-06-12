# NotebookLM Enterprise — Google OAuth2 auth (shared lib)

A **framework-agnostic, zero-dependency** TypeScript module that handles the
**Google OAuth 2.0 authorization-code (user consent) flow** needed to call the
**NotebookLM Enterprise API**, plus a thin REST client for that API.

> **Reality check.** NotebookLM has **no public consumer API**. The only
> official programmatic surface is the **NotebookLM Enterprise** API, served by
> **Discovery Engine** on Google Cloud and reachable only for organizations that
> have provisioned NotebookLM Enterprise. This module authenticates against
> that API. It does **not** use the fragile unofficial/undocumented endpoints.

This is a **shared library only** — it is intentionally *not* wired into the
Next.js console or the `beyond-style-uae` storefront. Import it from whichever
app owns the sign-in and callback routes.

## What's here

| File | Responsibility |
| --- | --- |
| `config.ts` | Load + validate config from env (`loadNotebookLmConfig`) |
| `pkce.ts` | PKCE verifier/challenge + CSRF state (Web Crypto) |
| `auth.ts` | Build consent URL, exchange code, refresh, expiry check |
| `tokenStore.ts` | `TokenStore` interface + `InMemoryTokenStore` (dev only) |
| `client.ts` | `NotebookLmSession` (auto-refresh) + `NotebookLmClient` (REST) |
| `index.ts` | Barrel exports |
| `.env.example` | Required environment variables |

## One-time Google Cloud setup

1. **Enable** the Discovery Engine API and provision **NotebookLM Enterprise**
   in your Google Cloud project (see Google's "Set up NotebookLM Enterprise").
2. **APIs & Services → OAuth consent screen**: configure it, and add the scope
   `https://www.googleapis.com/auth/cloud-platform`.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID →
   Web application.** Add your redirect URI (e.g.
   `http://localhost:3000/api/notebooklm/callback`) to *Authorized redirect
   URIs*. Copy the client id + secret.
4. Copy `.env.example` values into your app's env and fill them in. Use the
   project **number**, not the project id, for `NOTEBOOKLM_PROJECT_NUMBER`.

## The flow (two routes in your app)

```ts
import {
  loadNotebookLmConfig,
  beginAuthorization,
  exchangeCodeForTokens,
  InMemoryTokenStore,
  NotebookLmSession,
  NotebookLmClient,
} from "../../integrations/notebooklm";

const config = loadNotebookLmConfig();      // reads process.env
const store = new InMemoryTokenStore();      // swap for a real store

// 1) Start sign-in: GET /api/notebooklm/start
//    Persist { state, codeVerifier } server-side (session/db), then redirect.
const { url, state, codeVerifier } = await beginAuthorization(config, {
  loginHint: "user@example.com", // optional
});
// saveToSession({ state, codeVerifier }); redirect(url);

// 2) Callback: GET /api/notebooklm/callback?code=...&state=...
//    Verify state matches what you stored, then exchange the code.
function handleCallback(query: { code: string; state: string }, saved: {
  state: string;
  codeVerifier: string;
}, userId: string) {
  if (query.state !== saved.state) throw new Error("state mismatch");
  return exchangeCodeForTokens(config, {
    code: query.code,
    codeVerifier: saved.codeVerifier,
  }).then((tokens) => store.set(userId, tokens));
}

// 3) Call the API later — the session refreshes the token as needed.
async function listForUser(userId: string) {
  const session = new NotebookLmSession(config, store, userId);
  const client = new NotebookLmClient(config, () => session.getAccessToken());
  return client.listNotebooks();
}
```

## Security notes

- **State**: always compare the `state` on the callback against the value you
  stored before redirecting — this is your CSRF defense.
- **PKCE**: `code_verifier` must be stored server-side (never exposed to the
  browser) and used exactly once at the code exchange.
- **Refresh tokens are long-lived secrets** — encrypt them at rest. The bundled
  `InMemoryTokenStore` is for local dev/tests only; implement `TokenStore`
  against your real datastore (e.g. an encrypted Supabase column) for
  production.
- `access_type=offline` + `prompt=consent` are set so Google returns a refresh
  token. On subsequent refreshes Google omits `refresh_token`; the module
  preserves the previously stored one automatically.

## Tests

Covered by `tests/notebooklm-auth.test.ts` (root Vitest). Run from the repo
root:

```bash
npm run test
```

The suite uses an injected `fetch` double, so **no real network calls** are
made: config validation, the RFC 7636 PKCE test vector, authorization-URL
construction, code exchange / refresh normalization, token-expiry skew, the
auto-refreshing session, and the Discovery Engine URL builder.
