// No-op shim. Real `server-only` throws when imported from a client
// component; vitest runs in pure Node so the runtime check is moot.
export {};
