import { describe, expect, it } from "vitest";
import {
  CLOUD_PLATFORM_SCOPE,
  GOOGLE_AUTH_ENDPOINT,
  GOOGLE_TOKEN_ENDPOINT,
  InMemoryTokenStore,
  NotebookLmClient,
  NotebookLmSession,
  beginAuthorization,
  createAuthorizationUrl,
  deriveCodeChallenge,
  exchangeCodeForTokens,
  generateCodeVerifier,
  isExpired,
  loadNotebookLmConfig,
  refreshAccessToken,
  type NotebookLmConfig,
  type NotebookLmEnv,
  type TokenSet,
} from "../integrations/notebooklm/index";

const ENV: NotebookLmEnv = {
  GOOGLE_OAUTH_CLIENT_ID: "client-123.apps.googleusercontent.com",
  GOOGLE_OAUTH_CLIENT_SECRET: "secret-xyz",
  GOOGLE_OAUTH_REDIRECT_URI: "https://app.example.com/api/notebooklm/callback",
  NOTEBOOKLM_PROJECT_NUMBER: "123456789012",
  NOTEBOOKLM_LOCATION: "global",
  NOTEBOOKLM_ENDPOINT_LOCATION: "us",
};

const config: NotebookLmConfig = loadNotebookLmConfig(ENV);

/** A fetch double that returns a fixed JSON response and records the call. */
function jsonFetch(payload: unknown, init: { ok?: boolean; status?: number } = {}) {
  const calls: { url: string; body: string; headers: Record<string, string> }[] = [];
  const fetchImpl = (async (url: string, opts: RequestInit) => {
    calls.push({ url, body: String(opts.body), headers: (opts.headers ?? {}) as Record<string, string> });
    return {
      ok: init.ok ?? true,
      status: init.status ?? 200,
      statusText: "OK",
      json: async () => payload,
      text: async () => JSON.stringify(payload),
    } as unknown as Response;
  }) as unknown as typeof fetch;
  return { fetchImpl, calls };
}

describe("config", () => {
  it("defaults scope, location, and endpoint location", () => {
    const c = loadNotebookLmConfig({ ...ENV, NOTEBOOKLM_ENDPOINT_LOCATION: undefined, NOTEBOOKLM_LOCATION: undefined });
    expect(c.scopes).toEqual([CLOUD_PLATFORM_SCOPE]);
    expect(c.location).toBe("global");
    expect(c.endpointLocation).toBe("global");
  });

  it("throws a descriptive error on missing required vars", () => {
    expect(() => loadNotebookLmConfig({ ...ENV, GOOGLE_OAUTH_CLIENT_ID: "" })).toThrow(
      /GOOGLE_OAUTH_CLIENT_ID/,
    );
  });

  it("rejects an invalid endpoint location", () => {
    expect(() => loadNotebookLmConfig({ ...ENV, NOTEBOOKLM_ENDPOINT_LOCATION: "apac" })).toThrow(
      /NOTEBOOKLM_ENDPOINT_LOCATION/,
    );
  });

  it("parses multiple whitespace/comma separated scopes", () => {
    const c = loadNotebookLmConfig({ ...ENV, NOTEBOOKLM_SCOPES: "a, b  c" });
    expect(c.scopes).toEqual(["a", "b", "c"]);
  });
});

describe("PKCE", () => {
  it("derives a stable S256 challenge for a known verifier", async () => {
    // RFC 7636 Appendix B test vector.
    const challenge = await deriveCodeChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk");
    expect(challenge).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });

  it("generates unique high-entropy verifiers", () => {
    const a = generateCodeVerifier();
    const b = generateCodeVerifier();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(43);
  });
});

describe("authorization URL", () => {
  it("includes PKCE, offline access, and required params", () => {
    const url = new URL(
      createAuthorizationUrl(config, { state: "st", codeChallenge: "cc" }),
    );
    expect(`${url.origin}${url.pathname}`).toBe(GOOGLE_AUTH_ENDPOINT);
    expect(url.searchParams.get("client_id")).toBe(ENV.GOOGLE_OAUTH_CLIENT_ID);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("code_challenge")).toBe("cc");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("scope")).toBe(CLOUD_PLATFORM_SCOPE);
    expect(url.searchParams.get("state")).toBe("st");
  });

  it("beginAuthorization mints a matching state/verifier/challenge", async () => {
    const pending = await beginAuthorization(config, { loginHint: "u@example.com" });
    const url = new URL(pending.url);
    expect(url.searchParams.get("state")).toBe(pending.state);
    expect(url.searchParams.get("login_hint")).toBe("u@example.com");
    expect(url.searchParams.get("code_challenge")).toBe(
      await deriveCodeChallenge(pending.codeVerifier),
    );
  });
});

describe("token exchange + refresh", () => {
  it("exchanges a code and normalizes expiry", async () => {
    const { fetchImpl, calls } = jsonFetch({
      access_token: "at-1",
      refresh_token: "rt-1",
      expires_in: 3600,
      token_type: "Bearer",
      scope: CLOUD_PLATFORM_SCOPE,
    });
    const before = Date.now();
    const token = await exchangeCodeForTokens(
      config,
      { code: "auth-code", codeVerifier: "ver" },
      fetchImpl,
    );
    expect(calls[0].url).toBe(GOOGLE_TOKEN_ENDPOINT);
    expect(calls[0].body).toContain("grant_type=authorization_code");
    expect(calls[0].body).toContain("code_verifier=ver");
    expect(token.accessToken).toBe("at-1");
    expect(token.refreshToken).toBe("rt-1");
    expect(token.expiresAt).toBeGreaterThanOrEqual(before + 3600 * 1000);
  });

  it("carries the prior refresh token when refresh response omits it", async () => {
    const { fetchImpl } = jsonFetch({
      access_token: "at-2",
      expires_in: 3600,
      token_type: "Bearer",
    });
    const previous: TokenSet = {
      accessToken: "old",
      refreshToken: "rt-keep",
      expiresAt: 0,
      tokenType: "Bearer",
    };
    const token = await refreshAccessToken(config, "rt-keep", previous, fetchImpl);
    expect(token.accessToken).toBe("at-2");
    expect(token.refreshToken).toBe("rt-keep");
  });

  it("throws with status + body on token endpoint errors", async () => {
    const { fetchImpl } = jsonFetch({ error: "invalid_grant" }, { ok: false, status: 400 });
    await expect(
      exchangeCodeForTokens(config, { code: "bad", codeVerifier: "v" }, fetchImpl),
    ).rejects.toThrow(/400/);
  });
});

describe("isExpired", () => {
  it("treats tokens within the skew window as expired", () => {
    const now = 1_000_000;
    expect(isExpired({ expiresAt: now + 30_000 } as TokenSet, now)).toBe(true);
    expect(isExpired({ expiresAt: now + 120_000 } as TokenSet, now)).toBe(false);
  });
});

describe("session", () => {
  it("refreshes and persists when the stored token is expired", async () => {
    const store = new InMemoryTokenStore();
    await store.set("user-1", {
      accessToken: "stale",
      refreshToken: "rt-1",
      expiresAt: Date.now() - 1,
      tokenType: "Bearer",
    });
    const { fetchImpl } = jsonFetch({
      access_token: "fresh",
      expires_in: 3600,
      token_type: "Bearer",
    });
    const session = new NotebookLmSession(config, store, "user-1", fetchImpl);
    expect(await session.getAccessToken()).toBe("fresh");
    expect((await store.get("user-1"))?.accessToken).toBe("fresh");
  });

  it("errors when no tokens exist for the user", async () => {
    const session = new NotebookLmSession(config, new InMemoryTokenStore(), "ghost");
    await expect(session.getAccessToken()).rejects.toThrow(/No tokens/);
  });
});

describe("client", () => {
  it("builds the Discovery Engine notebooks URL from config", () => {
    const client = new NotebookLmClient(config, async () => "tok");
    expect(client.notebooksUrl()).toBe(
      "https://us-discoveryengine.googleapis.com/v1alpha" +
        "/projects/123456789012/locations/global/notebooks",
    );
  });

  it("sends a bearer token and parses the response", async () => {
    const { fetchImpl, calls } = jsonFetch({ notebooks: [{ notebookId: "nb-1" }] });
    const client = new NotebookLmClient(config, async () => "tok-abc", fetchImpl);
    const result = await client.listNotebooks();
    expect(result.notebooks?.[0].notebookId).toBe("nb-1");
    expect(calls[0].url).toContain("/notebooks");
    expect(calls[0].headers.authorization).toBe("Bearer tok-abc");
  });
});
