import { pool } from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
  try {
    // Read the migration SQL file
    const migrationFile = path.join(__dirname, "migration.sql");
    const sql = fs.readFileSync(migrationFile, "utf8");

    // Split SQL statements and execute them one by one
    const statements = sql
      .split(";")
      .filter((statement) => statement.trim() !== "");

    for (const statement of statements) {
      await pool.query(statement);
      console.log("Executed SQL statement successfully");
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error running migration:", error);
    process.exit(1);
  }
};

runMigration();
