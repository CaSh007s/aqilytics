import { Pool } from "pg";

let pool: Pool;

if (!global.pool) {
  global.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Neon
    },
  });
}

pool = global.pool;

export default pool;

// Extend the NodeJS global type to include pool
declare global {
  var pool: Pool | undefined;
}
