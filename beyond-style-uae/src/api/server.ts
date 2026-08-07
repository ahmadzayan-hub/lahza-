import { serve } from "@hono/node-server";
import { app } from "@/api/app";

// Local development server. On Vercel the same `app` is served through
// api/[[...route]].ts instead.
const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port });
console.info(`Beyond Style UAE API listening on :${port}`);
