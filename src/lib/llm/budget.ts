/**
 * Simple in-memory per-process daily call counter. Prevents a runaway
 * cost spike if an API key leaks or a client loops. NOT a hard ledger —
 * each serverless instance has its own counter — but enough for a soft
 * brake on top of OpenAI's account-level limits.
 *
 * For production-grade enforcement, replace with a Redis or Supabase
 * row backed counter.
 */

const DAILY_LIMIT = Number(process.env.LLM_DAILY_CALL_LIMIT ?? 500);

let resetAt = startOfNextDay();
let callsToday = 0;

function startOfNextDay(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime();
}

export interface BudgetCheck {
  ok: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
}

export function checkBudget(): BudgetCheck {
  if (Date.now() >= resetAt) {
    callsToday = 0;
    resetAt = startOfNextDay();
  }
  const remaining = Math.max(0, DAILY_LIMIT - callsToday);
  return { ok: remaining > 0, remaining, limit: DAILY_LIMIT, resetAt };
}

export function recordCall(): void {
  callsToday += 1;
}
