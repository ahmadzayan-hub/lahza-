import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "mysql://root:root@localhost:3306/beyond_style";

// A small pool is plenty for a single Hono node process.
const pool = mysql.createPool({ uri: url, connectionLimit: 5 });

export const db = drizzle(pool, { schema, mode: "default" });
export { schema };
