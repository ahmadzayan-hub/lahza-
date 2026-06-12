/**
 * PKCE + state helpers (RFC 7636), built on Web Crypto so the module runs
 * unchanged on Node 18+/22, Deno, and edge runtimes.
 */

/** Base64url-encode bytes without padding (RFC 7636 §A). */
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Cryptographically-random base64url string of `byteLength` bytes. */
function randomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/** A high-entropy PKCE code verifier (43–128 chars). */
export function generateCodeVerifier(): string {
  return randomToken(32);
}

/** An opaque CSRF `state` value to round-trip through the consent screen. */
export function generateState(): string {
  return randomToken(16);
}

/** S256 code challenge for a given verifier. */
export async function deriveCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return base64UrlEncode(new Uint8Array(digest));
}
