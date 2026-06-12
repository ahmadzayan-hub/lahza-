/**
 * Shared types for the NotebookLM Enterprise OAuth2 integration.
 *
 * NotebookLM has no public *consumer* API. The only official programmatic
 * surface is the NotebookLM Enterprise API, served by Discovery Engine on
 * Google Cloud and authenticated with a Google OAuth2 bearer token.
 * These types describe the user-consent (authorization-code) flow.
 */

/** Where the multi-regional Discovery Engine endpoint is hosted. */
export type EndpointLocation = "global" | "us" | "eu";

/** Resolved configuration for the integration (see {@link ./config.ts}). */
export interface NotebookLmConfig {
  /** Google OAuth2 client id (Web application credentials). */
  clientId: string;
  /** Google OAuth2 client secret. */
  clientSecret: string;
  /** Redirect URI registered on the OAuth client, e.g. https://app/callback. */
  redirectUri: string;
  /** OAuth scopes requested. Defaults to the cloud-platform scope. */
  scopes: string[];
  /** GCP project *number* (not id) that owns the NotebookLM notebooks. */
  projectNumber: string;
  /** Resource location for notebooks, e.g. "global", "us", "eu". */
  location: string;
  /** Hostname prefix for the Discovery Engine endpoint. */
  endpointLocation: EndpointLocation;
}

/** A normalized OAuth2 token set as stored by the integration. */
export interface TokenSet {
  accessToken: string;
  /** Present only when access_type=offline and consent was granted. */
  refreshToken?: string;
  /** Epoch milliseconds at which {@link accessToken} expires. */
  expiresAt: number;
  /** Space-delimited scopes actually granted by the user. */
  scope?: string;
  tokenType: string;
}

/** Everything needed to resume a pending authorization after redirect. */
export interface PendingAuthorization {
  /** The Google consent screen URL to send the user to. */
  url: string;
  /** Opaque CSRF token — verify it matches on the callback. */
  state: string;
  /** PKCE verifier — persist server-side, needed for the code exchange. */
  codeVerifier: string;
}

/** Raw token endpoint response shape (subset we rely on). */
export interface RawTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
}
