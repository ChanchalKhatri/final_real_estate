import { pool } from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Apartment from "../models/Apartment.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userTableQuery = `CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'seller', 'admin') NOT NULL DEFAULT 'user',
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const teamTableQuery = `CREATE TABLE IF NOT EXISTS team (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const clientTableQuery = `CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  feedback TEXT NOT NULL,
  rating ENUM('1', '2', '3', '4', '5') NOT NULL,
  image VARCHAR(255), 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const propertyTableQuery = `CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  price VARCHAR(50) NOT NULL,
  bedrooms INT CHECK (bedrooms >= 1),
  bathrooms INT CHECK (bathrooms >= 1),
  area INT NOT NULL,
  image VARCHAR(255),
  description VARCHAR(255) NOT NULL,

  property_type VARCHAR(100) NOT NULL, -- e.g., Apartment, Villa, Plot
  status ENUM('available', 'sold', 'pending') DEFAULT 'available',
  furnishing ENUM('furnished', 'semi-furnished', 'unfurnished'),
  year_built YEAR,
  floor_number INT,
  total_floors INT,
  parking_spaces INT DEFAULT 0,
  
  owner_id INT,
  owner_type ENUM('admin', 'seller') DEFAULT 'admin',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);`;

const propertyImagesTableQuery = `CREATE TABLE IF NOT EXISTS property_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);`;

const userPropertiesTableQuery = `CREATE TABLE IF NOT EXISTS user_properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  property_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const paymentTableQuery = `CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  property_id INT NOT NULL,
  total_price DECIMAL(10, 2),
  amount_paid DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  payment_details JSON NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  invoice_number VARCHAR(50),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`;

const contactTableQuery = `CREATE TABLE IF NOT EXISTS contact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const createTable = async (tableName, query) => {
  try {
    await pool.execute(query);
    console.log(`${tableName} table created or already exists`);
  } catch (error) {
    console.error(`Error creating ${tableName} table:`, error);
  }
};

// Check if the profile_image column exists in the users table
const checkAndUpdateUsersTable = async () => {
  try {
    // Check if profile_image column exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'profile_image'
    `);

    // If column doesn't exist, add it
    if (columns.length === 0) {
      await pool.query(`
        ALTER TABLE users
        ADD COLUMN profile_image VARCHAR(255)
      `);
      console.log("Added profile_image column to users table");
    }
  } catch (error) {
    console.error("Error updating users table schema:", error);
  }
};

const runMigrationScript = async () => {
  try {
    const migrationPath = path.join(__dirname, "migration.sql");
    const migrationScript = fs.readFileSync(migrationPath, "utf8");

    // Split the script by semicolons to execute each statement separately
    const statements = migrationScript.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.execute(statement.trim());
        } catch (err) {
          // Log the error but continue with other statements
          console.log(`Migration statement error: ${err.message}`);
        }
      }
    }

    console.log("Migration script executed successfully");
  } catch (error) {
    console.error("Error running migration script:", error);
  }
};

const createAllTable = async () => {
  // Create tables
  await createTable("users", userTableQuery);
  await createTable("team", teamTableQuery);
  await createTable("clients", clientTableQuery);
  await createTable("properties", propertyTableQuery);
  await createTable("property_images", propertyImagesTableQuery);
  await createTable("user_properties", userPropertiesTableQuery);
  await createTable("payments", paymentTableQuery);
  await createTable("contact", contactTableQuery);

  // Create apartment tables
  await Apartment.createTable();

  // Run migration script
  await runMigrationScript();
};

export default createAllTable;
