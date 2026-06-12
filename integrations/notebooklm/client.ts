import { type FetchLike, isExpired, refreshAccessToken } from "./auth";
import type { TokenStore } from "./tokenStore";
import type { NotebookLmConfig, TokenSet } from "./types";

/**
 * A per-user session: hands out a valid access token, transparently refreshing
 * (and persisting) it when the stored one is expired or about to expire.
 */
export class NotebookLmSession {
  constructor(
    private readonly config: NotebookLmConfig,
    private readonly store: TokenStore,
    private readonly userId: string,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  /** Return a valid access token, refreshing through the store if needed. */
  async getAccessToken(): Promise<string> {
    const current = await this.store.get(this.userId);
    if (!current) {
      throw new Error(
        `[notebooklm] No tokens for user "${this.userId}". ` +
          `Run the authorization-code flow first.`,
      );
    }
    if (!isExpired(current)) return current.accessToken;

    if (!current.refreshToken) {
      throw new Error(
        `[notebooklm] Access token expired and no refresh token is stored for ` +
          `user "${this.userId}". Re-run authorization with prompt=consent.`,
      );
    }
    const refreshed = await refreshAccessToken(
      this.config,
      current.refreshToken,
      current,
      this.fetchImpl,
    );
    await this.store.set(this.userId, refreshed);
    return refreshed.accessToken;
  }
}

/** Minimal shape of a NotebookLM Enterprise notebook resource. */
export interface Notebook {
  /** Full resource name: projects/{n}/locations/{loc}/notebooks/{id}. */
  name?: string;
  notebookId?: string;
  title?: string;
  [key: string]: unknown;
}

/** A function that yields a currently-valid bearer access token. */
export type AccessTokenProvider = () => Promise<string>;

/**
 * Thin REST client for the NotebookLM Enterprise API (served by Discovery
 * Engine on Google Cloud). It only handles request shaping + auth; the exact
 * request/response fields are governed by Google's `v1alpha` reference and may
 * evolve, so responses are returned loosely typed.
 *
 * Base URL:
 *   https://{endpointLocation}-discoveryengine.googleapis.com/v1alpha
 *     /projects/{projectNumber}/locations/{location}/notebooks
 */
export class NotebookLmClient {
  constructor(
    private readonly config: NotebookLmConfig,
    private readonly getAccessToken: AccessTokenProvider,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  /** Collection URL for notebooks under the configured project/location. */
  notebooksUrl(): string {
    const { endpointLocation, projectNumber, location } = this.config;
    return (
      `https://${endpointLocation}-discoveryengine.googleapis.com/v1alpha` +
      `/projects/${projectNumber}/locations/${location}/notebooks`
    );
  }

  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
  ): Promise<T> {
    const token = await this.getAccessToken();
    const response = await this.fetchImpl(url, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(
        `[notebooklm] ${method} ${url} -> ${response.status} ${response.statusText}` +
          (detail ? `: ${detail}` : ""),
      );
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  }

  /** List notebooks in the configured project/location. */
  listNotebooks(): Promise<{ notebooks?: Notebook[] }> {
    return this.request("GET", this.notebooksUrl());
  }

  /** Create a notebook with the given display title. */
  createNotebook(notebook: { title: string } & Partial<Notebook>): Promise<Notebook> {
    return this.request("POST", this.notebooksUrl(), notebook);
  }

  /** Fetch a single notebook by its short id. */
  getNotebook(notebookId: string): Promise<Notebook> {
    return this.request("GET", `${this.notebooksUrl()}/${encodeURIComponent(notebookId)}`);
  }

  /** Delete a notebook by its short id. */
  deleteNotebook(notebookId: string): Promise<void> {
    return this.request("DELETE", `${this.notebooksUrl()}/${encodeURIComponent(notebookId)}`);
  }
}
