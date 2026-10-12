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
  password: process.env.DB_PASSWORD || "",
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
    // 1. First connect without database selected to ensure database exists
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
