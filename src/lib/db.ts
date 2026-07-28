import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "@/db/schema";

function getConnectionString(): string {
  let connectionString = process.env.DATABASE_URL;

  try {
    const { env } = getCloudflareContext();
    if (env?.HYPERDRIVE?.connectionString) {
      connectionString = env.HYPERDRIVE.connectionString;
    }
  } catch {
    // local dev / build-time — not in a Workers request context
  }

  if (!connectionString) {
    throw new Error(
      "No database connection string found. Set DATABASE_URL locally, or configure the HYPERDRIVE binding for production."
    );
  }

  return connectionString;
}

// Cloudflare Workers forbid reusing a connection opened in one request
// during a later request, so we open a lightweight Pool per request and
// close it when done. Hyperdrive still pools the real Postgres connections
// on Cloudflare's side, so this stays cheap.
export async function withDb<T>(
  fn: (db: ReturnType<typeof drizzle<typeof schema>>) => Promise<T>
): Promise<T> {
  const pool = new Pool({ connectionString: getConnectionString(), max: 5 });
  const db = drizzle(pool, { schema });
  try {
    return await fn(db);
  } finally {
    await pool.end();
  }
}