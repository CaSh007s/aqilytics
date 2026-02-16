import { Pool } from "pg";

const pool =
  global.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Required for Neon
    },
  });

if (process.env.NODE_ENV !== "production") {
  global.pool = pool;
}

export default pool;

// Extend the NodeJS global type to include pool
declare global {
  var pool: Pool | undefined;
}
