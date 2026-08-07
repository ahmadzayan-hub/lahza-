import { randomUUID } from "node:crypto";
import { db, schema } from "@/db";

/**
 * Resolve the configured admin identities (token → actor name).
 * Supports a single `ADMIN_TOKEN` (actor "admin") and/or a comma-separated
 * `ADMIN_TOKENS` of `name:token` pairs, so a team can each have their own
 * token and show up by name in the audit log.
 */
export function adminIdentities(): Map<string, string> {
  const map = new Map<string, string>();
  const single = process.env.ADMIN_TOKEN;
  if (single) map.set(single, "admin");

  const multi = process.env.ADMIN_TOKENS;
  if (multi) {
    for (const pair of multi.split(",")) {
      const idx = pair.indexOf(":");
      if (idx <= 0) continue;
      const name = pair.slice(0, idx).trim();
      const token = pair.slice(idx + 1).trim();
      if (name && token) map.set(token, name);
    }
  }
  return map;
}

/** Returns the actor name for a token, or null if it isn't a valid admin token. */
export function resolveActor(token: string | undefined): string | null {
  if (!token) return null;
  return adminIdentities().get(token) ?? null;
}

/** Best-effort append to the audit trail; never throws into the request path. */
export async function audit(
  actor: string,
  action: string,
  target?: string,
  detail?: Record<string, unknown>,
): Promise<void> {
  try {
    await db.insert(schema.adminAudit).values({
      id: randomUUID(),
      actor,
      action,
      target,
      detail,
    });
  } catch (err) {
    console.error("[audit:error]", err);
  }
}
