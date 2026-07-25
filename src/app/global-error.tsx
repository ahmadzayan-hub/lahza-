"use client";

/**
 * Last-resort error boundary. Rendered when the root layout itself
 * throws. Deliberately zero dependencies (no fonts, no providers)
 * so it always paints something.
 */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        margin: 0,
        padding: "2rem",
        background: "#f8fafc",
        color: "#0f172a"
      }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, margin: 0 }}>Draftly needs a restart</h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "#475569" }}>
            An unexpected error occurred. Please try again.
          </p>
          <p style={{ marginTop: 12, fontSize: 12, color: "#94a3b8", fontFamily: "ui-monospace, monospace" }}>
            {error.digest ?? error.message.slice(0, 100)}
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              padding: "10px 18px",
              borderRadius: 8,
              border: 0,
              background: "#0d9488",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
