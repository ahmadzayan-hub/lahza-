import Link from "next/link";
import { PageHeader, SectionTitle } from "@/components/ui";
import { getNotebookLmStatus } from "@/lib/integrations/notebooklm-session";
import { DEFAULT_NOTEBOOKLM_SCOPES } from "@/lib/integrations/notebooklm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Integrations" };

const STATUS_BANNER: Record<string, { tone: "ok" | "warn" | "err"; text: string }> = {
  connected: { tone: "ok", text: "NotebookLM connected. The console can now act on your Google account." },
  disconnected: { tone: "warn", text: "NotebookLM disconnected. Tokens were revoked and cleared." },
  denied: { tone: "warn", text: "Authorisation was cancelled — no access was granted." },
  state_mismatch: { tone: "err", text: "Security check failed (state mismatch). Please try connecting again." },
  exchange_failed: { tone: "err", text: "Could not exchange the authorisation code. Check the client secret and redirect URI." },
  not_configured: { tone: "err", text: "NotebookLM OAuth is not configured on the server. Set the GOOGLE_OAUTH_* env vars." },
  error: { tone: "err", text: "Something went wrong during authorisation. Please try again." },
};

export default function IntegrationsPage({
  searchParams,
}: {
  searchParams: { notebooklm?: string };
}) {
  const status = getNotebookLmStatus();
  const banner = searchParams.notebooklm ? STATUS_BANNER[searchParams.notebooklm] : undefined;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Integrations"
        subtitle="Connect external accounts the console can act on. OAuth tokens are encrypted and stored httpOnly — never exposed to the browser."
      />

      {banner && (
        <div
          className={
            "mb-4 rounded-2xl border p-3 text-sm " +
            (banner.tone === "ok"
              ? "border-green-200 bg-green-50 text-green-900"
              : banner.tone === "warn"
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-red-200 bg-red-50 text-red-900")
          }
        >
          {banner.text}
        </div>
      )}

      <div className="card">
        <SectionTitle
          action={
            <span
              className={
                "badge " +
                (status.connected ? "badge-pass" : status.configured ? "badge-warn" : "badge-neutral")
              }
            >
              {status.connected ? "connected" : status.configured ? "not connected" : "not configured"}
            </span>
          }
        >
          NotebookLM (Google)
        </SectionTitle>

        <p className="text-sm text-smoke">
          Authorise the console to access NotebookLM via Google OAuth 2.0. Used to read your
          notebook sources from Google Drive and enrich customer research. We request offline
          access so the connection survives without re-prompting.
        </p>

        <dl className="mt-3 grid grid-cols-1 gap-1 text-sm md:grid-cols-2">
          <Row k="Provider" v="Google OAuth 2.0 (authorization code)" />
          <Row
            k="Scopes"
            v={(status.scopes.length ? status.scopes : DEFAULT_NOTEBOOKLM_SCOPES)
              .map(shortScope)
              .join(", ")}
          />
          {status.connected && status.expiresAt && (
            <Row k="Access token expires" v={new Date(status.expiresAt).toLocaleString("en-AE")} />
          )}
          <Row k="Token storage" v="Encrypted, httpOnly cookie (AES-256-GCM)" />
        </dl>

        {!status.configured && (
          <p className="mt-3 rounded-lg bg-sand/40 p-2 text-xs text-smoke">
            Set <code>GOOGLE_OAUTH_CLIENT_ID</code>, <code>GOOGLE_OAUTH_CLIENT_SECRET</code> and
            (optionally) <code>GOOGLE_OAUTH_REDIRECT_URI</code> on the host, then reload. See
            <code> .env.example</code>.
          </p>
        )}

        <div className="mt-4 flex items-center gap-2">
          {status.connected ? (
            <>
              <Link href="/api/integrations/notebooklm/authorize" className="btn btn-ghost">
                Reconnect
              </Link>
              <form method="post" action="/api/integrations/notebooklm/disconnect">
                <button type="submit" className="btn btn-ghost text-red-700">
                  Disconnect
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/api/integrations/notebooklm/authorize"
              className={"btn btn-primary" + (status.configured ? "" : " pointer-events-none opacity-50")}
              aria-disabled={!status.configured}
            >
              Connect NotebookLM
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-44 shrink-0 text-smoke">{k}</dt>
      <dd className="break-words">{v}</dd>
    </div>
  );
}

// Trim long Google scope URLs to a readable tail (e.g. drive.readonly).
function shortScope(scope: string): string {
  if (!scope.startsWith("http")) return scope;
  const tail = scope.split("/auth/")[1] ?? scope;
  return tail;
}
