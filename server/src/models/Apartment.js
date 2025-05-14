import { pool } from "../config/db.js";

class Apartment {
  static async createTable() {
    const createApartmentsTableQuery = `
      CREATE TABLE IF NOT EXISTS apartments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        amenities TEXT,
        image VARCHAR(255),
        owner_id INT,
        owner_type ENUM('admin', 'seller') DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    const createApartmentUnitsTableQuery = `
      CREATE TABLE IF NOT EXISTS apartment_units (
        id INT AUTO_INCREMENT PRIMARY KEY,
        apartment_id INT NOT NULL,
        unit_number VARCHAR(10) NOT NULL,
        floor_number INT NOT NULL,
        price DECIMAL(10, 2),
        bedrooms INT,
        bathrooms INT,
        area DECIMAL(10, 2),
        status VARCHAR(20) DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
      )
    `;

    const createApartmentImagesTableQuery = `
      CREATE TABLE IF NOT EXISTS apartment_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        apartment_id INT NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
      )
    `;

    const createApartmentBookingsTableQuery = `
      CREATE TABLE IF NOT EXISTS apartment_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        apartment_id INT NOT NULL,
        unit_id INT NOT NULL,
        payment_id INT,
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled', 'deposit_paid') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
        FOREIGN KEY (unit_id) REFERENCES apartment_units(id) ON DELETE CASCADE
      )
    `;

    const createPaymentsTableQuery = `
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        property_id INT NOT NULL,
        total_price DECIMAL(10, 2),
        amount_paid DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_details TEXT NOT NULL,
        status VARCHAR(50) NOT NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        invoice_number VARCHAR(50),
        is_deposit BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    const addIsDepositColumnQuery = `
      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS is_deposit BOOLEAN DEFAULT FALSE AFTER invoice_number
    `;

    const addUnitDetailsColumnQuery = `
      ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS unit_details TEXT AFTER is_deposit
    `;

    try {
      await pool.query(createApartmentsTableQuery);
      await pool.query(createApartmentUnitsTableQuery);
      await pool.query(createApartmentImagesTableQuery);
      await pool.query(createApartmentBookingsTableQuery);
      await pool.query(createPaymentsTableQuery);

      // Add is_deposit column to payments table if it doesn't exist
      try {
        await pool.query(addIsDepositColumnQuery);
        console.log(
          "Added is_deposit column to payments table if it didn't exist"
        );
      } catch (columnError) {
        console.error("Error adding is_deposit column:", columnError);
        // Continue anyway as the table might already have the column
      }

      // Add unit_details column to payments table if it doesn't exist
      try {
        await pool.query(addUnitDetailsColumnQuery);
        console.log(
          "Added unit_details column to payments table if it didn't exist"
        );
      } catch (columnError) {
        console.error("Error adding unit_details column:", columnError);
        // Continue anyway as the table might already have the column
      }

      console.log("Apartments tables created successfully");
    } catch (error) {
      console.error("Error creating apartments tables:", error);
      throw error;
    }
  }

  static async create(apartmentData, isMultiUnit, floorProperties) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Insert main apartment building
      const [result] = await connection.query(
        "INSERT INTO apartments (name, location, description, amenities, owner_id, owner_type) VALUES (?, ?, ?, ?, ?, ?)",
        [
          apartmentData.name,
          apartmentData.location,
          apartmentData.description || null,
          apartmentData.amenities || null,
          apartmentData.owner_id || null,
          apartmentData.owner_type || "admin",
        ]
      );

      const apartmentId = result.insertId;

      // Handle multi-unit apartment
      if (isMultiUnit && floorProperties && floorProperties.length > 0) {
        for (const floor of floorProperties) {
          for (const unit of floor.units) {
            await connection.query(
              "INSERT INTO apartment_units (apartment_id, unit_number, floor_number, price, bedrooms, bathrooms, area, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [
                apartmentId,
                unit.unitNumber,
                floor.floorNumber,
                unit.price || null,
                unit.bedrooms || null,
                unit.bathrooms || null,
                unit.area || null,
                unit.status || "available",
              ]
            );
          }
        }
      } else {
        // Handle single-unit apartment
        await connection.query(
          "INSERT INTO apartment_units (apartment_id, unit_number, floor_number, price, bedrooms, bathrooms, area, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            apartmentId,
            "1",
            apartmentData.floor_number || 1,
            apartmentData.price || null,
            apartmentData.bedrooms || null,
            apartmentData.bathrooms || null,
            apartmentData.area || null,
            apartmentData.status || "available",
          ]
        );
      }

      await connection.commit();
      return apartmentId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findAll() {
    try {
      // Get apartments with their first unit data
      const [apartments] = await pool.query(`
        SELECT a.*, u.price, u.bedrooms, u.bathrooms, u.area, u.status, 
          (SELECT image_path FROM apartment_images WHERE apartment_id = a.id ORDER BY is_primary DESC, id ASC LIMIT 1) as image
        FROM apartments a
        LEFT JOIN apartment_units u ON a.id = u.apartment_id
        GROUP BY a.id
        ORDER BY a.created_at DESC
      `);

      return apartments;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      // Get apartment details
      const [apartments] = await pool.query(
        "SELECT * FROM apartments WHERE id = ?",
        [id]
      );

      if (apartments.length === 0) {
        return null;
      }

      const apartment = apartments[0];

      // Get all units for this apartment
      const [units] = await pool.query(
        "SELECT * FROM apartment_units WHERE apartment_id = ? ORDER BY floor_number, unit_number",
        [id]
      );

      // Get all images for this apartment
      const [images] = await pool.query(
        "SELECT * FROM apartment_images WHERE apartment_id = ? ORDER BY is_primary DESC, id ASC",
        [id]
      );

      apartment.units = units;
      apartment.images = images;

      return apartment;
    } catch (error) {
      throw error;
    }
  }

  static async getApartmentUnits(apartmentId) {
    try {
      // Get all units for this apartment
      const [units] = await pool.query(
        "SELECT * FROM apartment_units WHERE apartment_id = ? ORDER BY floor_number, unit_number",
        [apartmentId]
      );

      return units;
    } catch (error) {
      console.error("Error fetching apartment units:", error);
      throw error;
    }
  }

  static async update(id, apartmentData, isMultiUnit, floorProperties) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Update apartment building
      await connection.query(
        "UPDATE apartments SET name = ?, location = ?, description = ?, amenities = ?, owner_id = ?, owner_type = ? WHERE id = ?",
        [
          apartmentData.name,
          apartmentData.location,
          apartmentData.description || null,
          apartmentData.amenities || null,
          apartmentData.owner_id || null,
          apartmentData.owner_type || "admin",
          id,
        ]
      );

      // For multi-unit update, we'll delete existing units and recreate them
      await connection.query(
        "DELETE FROM apartment_units WHERE apartment_id = ?",
        [id]
      );

      // Re-add units
      if (isMultiUnit && floorProperties && floorProperties.length > 0) {
        for (const floor of floorProperties) {
          for (const unit of floor.units) {
            await connection.query(
              "INSERT INTO apartment_units (apartment_id, unit_number, floor_number, price, bedrooms, bathrooms, area, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [
                id,
                unit.unitNumber,
                floor.floorNumber,
                unit.price || null,
                unit.bedrooms || null,
                unit.bathrooms || null,
                unit.area || null,
                unit.status || "available",
              ]
            );
          }
        }
      } else {
        // Handle single-unit apartment
        await connection.query(
          "INSERT INTO apartment_units (apartment_id, unit_number, floor_number, price, bedrooms, bathrooms, area, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            id,
            "1",
            apartmentData.floor_number || 1,
            apartmentData.price || null,
            apartmentData.bedrooms || null,
            apartmentData.bathrooms || null,
            apartmentData.area || null,
            apartmentData.status || "available",
          ]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    try {
      // The foreign key constraints will automatically delete related units and images
      const [result] = await pool.query("DELETE FROM apartments WHERE id = ?", [
        id,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async addImages(apartmentId, imagePaths) {
    try {
      if (!imagePaths || imagePaths.length === 0) {
        return [];
      }

      const values = imagePaths.map((path, index) => [
        apartmentId,
        path,
        index === 0,
      ]);
      const [result] = await pool.query(
        "INSERT INTO apartment_images (apartment_id, image_path, is_primary) VALUES ?",
        [values]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }
}

export default Apartment;
