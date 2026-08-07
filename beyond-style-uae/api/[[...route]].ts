import { handle } from "hono/vercel";
import { app } from "../src/api/app";

// Vercel serverless entry. The catch-all filename routes every /api/*
// request here; Hono matches against the full path (routes keep their
// /api prefix). Runs on the Node.js runtime — required because the
// Drizzle mysql2 driver needs Node, not the Edge runtime.
export const config = { runtime: "nodejs" };

export default handle(app);
