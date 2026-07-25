/**
 * Route-level loading fallback. Rendered while a server component is
 * suspended. Purely presentational so it costs nothing at runtime.
 */
export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800/60 rounded" />
        <div className="mt-8 grid gap-3">
          <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
