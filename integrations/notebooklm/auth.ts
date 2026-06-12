import { deriveCodeChallenge, generateCodeVerifier, generateState } from "./pkce";
import type {
  NotebookLmConfig,
  PendingAuthorization,
  RawTokenResponse,
  TokenSet,
} from "./types";

/** Google's OAuth2 authorization + token endpoints. */
export const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

/** Refresh this many ms before real expiry so calls never race the clock. */
const EXPIRY_SKEW_MS = 60_000;

/** Allow tests to inject a fetch implementation; defaults to global fetch. */
export type FetchLike = typeof fetch;

export interface AuthorizationUrlOptions {
  state: string;
  codeChallenge: string;
  /** Pre-fill the Google account chooser with this email. */
  loginHint?: string;
  /**
   * "consent" forces the consent screen (and a refresh_token) every time;
   * the default only prompts when needed and may omit refresh_token on repeat.
   */
  prompt?: "none" | "consent" | "select_account";
}

/**
 * Build the Google consent-screen URL for the authorization-code + PKCE flow.
 * `access_type=offline` is what makes Google return a refresh token.
 */
export function createAuthorizationUrl(
  config: NotebookLmConfig,
  options: AuthorizationUrlOptions,
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    access_type: "offline",
    include_granted_scopes: "true",
    state: options.state,
    code_challenge: options.codeChallenge,
    code_challenge_method: "S256",
    prompt: options.prompt ?? "consent",
  });
  if (options.loginHint) params.set("login_hint", options.loginHint);
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
}

/**
 * Convenience: mint a fresh state + PKCE pair and the consent URL in one call.
 * Persist `state` and `codeVerifier` server-side (keyed to the user/session)
 * so the callback can verify state and complete the code exchange.
 */
export async function beginAuthorization(
  config: NotebookLmConfig,
  options: Pick<AuthorizationUrlOptions, "loginHint" | "prompt"> = {},
): Promise<PendingAuthorization> {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await deriveCodeChallenge(codeVerifier);
  const url = createAuthorizationUrl(config, { state, codeChallenge, ...options });
  return { url, state, codeVerifier };
}

async function readTokenError(response: Response): Promise<never> {
  let detail = "";
  try {
    detail = await response.text();
  } catch {
    /* body already consumed or unavailable */
  }
  throw new Error(
    `[notebooklm] Token endpoint returned ${response.status} ${response.statusText}` +
      (detail ? `: ${detail}` : ""),
  );
}

function normalizeToken(raw: RawTokenResponse, previous?: TokenSet): TokenSet {
  return {
    accessToken: raw.access_token,
    // Google omits refresh_token on refresh responses — keep the prior one.
    refreshToken: raw.refresh_token ?? previous?.refreshToken,
    expiresAt: Date.now() + raw.expires_in * 1000,
    scope: raw.scope ?? previous?.scope,
    tokenType: raw.token_type ?? "Bearer",
  };
}

/**
 * Exchange an authorization `code` (from the redirect) for tokens. Pass the
 * `codeVerifier` you persisted when you built the authorization URL.
 */
export async function exchangeCodeForTokens(
  config: NotebookLmConfig,
  params: { code: string; codeVerifier: string },
  fetchImpl: FetchLike = fetch,
): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code_verifier: params.codeVerifier,
  });
  const response = await fetchImpl(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) await readTokenError(response);
  return normalizeToken((await response.json()) as RawTokenResponse);
}

/** Obtain a new access token from a stored refresh token. */
export async function refreshAccessToken(
  config: NotebookLmConfig,
  refreshToken: string,
  previous?: TokenSet,
  fetchImpl: FetchLike = fetch,
): Promise<TokenSet> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });
  const response = await fetchImpl(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) await readTokenError(response);
  return normalizeToken(
    (await response.json()) as RawTokenResponse,
    previous ?? { refreshToken } as TokenSet,
  );
}

/** True when the token is missing or within the refresh skew of expiry. */
export function isExpired(token: TokenSet, now: number = Date.now()): boolean {
  return now >= token.expiresAt - EXPIRY_SKEW_MS;
}
