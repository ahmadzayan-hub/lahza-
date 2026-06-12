import type { TokenSet } from "./types";

/**
 * Persistence boundary for per-user tokens. Implement this against your real
 * store (Supabase row, Redis, encrypted cookie session, …). Refresh tokens are
 * long-lived secrets — encrypt them at rest in any production implementation.
 */
export interface TokenStore {
  get(userId: string): Promise<TokenSet | undefined>;
  set(userId: string, tokens: TokenSet): Promise<void>;
  delete(userId: string): Promise<void>;
}

/**
 * In-memory store for local development and tests only. State is lost on
 * restart and not shared across processes — do not use in production.
 */
export class InMemoryTokenStore implements TokenStore {
  private readonly tokens = new Map<string, TokenSet>();

  async get(userId: string): Promise<TokenSet | undefined> {
    return this.tokens.get(userId);
  }

  async set(userId: string, tokens: TokenSet): Promise<void> {
    this.tokens.set(userId, tokens);
  }

  async delete(userId: string): Promise<void> {
    this.tokens.delete(userId);
  }
}
