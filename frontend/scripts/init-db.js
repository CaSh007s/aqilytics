require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not defined in .env.local");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

async function initDB() {
  try {
    await client.connect();
    console.log("✅ Connected to Neon Postgres");

    const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    await client.query(schemaSql);
    console.log("✅ Database schema applied successfully");

    // Verify table creation
    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    );
    console.log(
      "📊 Tables in public schema:",
      res.rows.map((r) => r.table_name).join(", "),
    );
  } catch (err) {
    console.error("❌ Error initializing database:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDB();
