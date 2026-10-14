import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "root",
  database: process.env.DB_NAME || "customer_support_db",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

let pool;

export async function initializeDatabase() {
  try {
    // 1. Connect to MySQL server to ensure database exists
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
      multipleStatements: true
    });

    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await rootConnection.end();

    // 2. Initialize connection pool
    pool = mysql.createPool(dbConfig);

    // 3. Check if tables exist, otherwise execute schema.sql
    const [tables] = await pool.query("SHOW TABLES;");
    if (tables.length === 0) {
      console.log("🌱 Database tables empty. Auto-executing schema.sql seed...");
      const schemaPath = path.join(__dirname, "schema.sql");
      if (fs.existsSync(schemaPath)) {
        const sql = fs.readFileSync(schemaPath, "utf8");
        await pool.query(sql);
        console.log("✅ Database schema and seed data created successfully!");
      }
    } else {
      console.log(`✅ Connected to MySQL database "${dbConfig.database}" with ${tables.length} tables.`);
    }

    // 4. Auto-migration: Ensure resolution purpose & plan columns exist
    try {
      const [colPurpose] = await pool.query("SHOW COLUMNS FROM tickets LIKE 'resolution_purpose';");
      if (colPurpose.length === 0) {
        await pool.query("ALTER TABLE tickets ADD COLUMN resolution_purpose VARCHAR(150) DEFAULT 'General Triage & Investigation';");
      }

      const [colPlan] = await pool.query("SHOW COLUMNS FROM tickets LIKE 'resolution_plan';");
      if (colPlan.length === 0) {
        await pool.query("ALTER TABLE tickets ADD COLUMN resolution_plan JSON DEFAULT NULL;");
      }

      const [colNotes] = await pool.query("SHOW COLUMNS FROM tickets LIKE 'resolution_notes';");
      if (colNotes.length === 0) {
        await pool.query("ALTER TABLE tickets ADD COLUMN resolution_notes TEXT DEFAULT NULL;");
      }

      const [colTarget] = await pool.query("SHOW COLUMNS FROM tickets LIKE 'target_resolution_date';");
      if (colTarget.length === 0) {
        await pool.query("ALTER TABLE tickets ADD COLUMN target_resolution_date VARCHAR(100) DEFAULT NULL;");
      }
    } catch (migErr) {
      console.warn("⚠️ Column auto-migration note:", migErr.message);
    }

    return pool;
  } catch (error) {
    console.error("❌ MySQL Connection Error:", error.message);
    console.warn("⚠️ Please check that MySQL Server is running and credentials in backend/.env are correct.");
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export default {
  initializeDatabase,
  getPool
};
