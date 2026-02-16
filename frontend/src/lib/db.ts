import { Pool } from "pg";

const pool =
  global.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Fix for "The SSL modes ... are treated as aliases for 'verify-full'" warning
    // We explicitly set ssl to true (equivalent to sslmode=require) and allow self-signed certs for Neon
    ssl: true,
  });

if (process.env.NODE_ENV !== "production") {
  global.pool = pool;
}

export default pool;

// Extend the NodeJS global type to include pool
declare global {
  var pool: Pool | undefined;
}
