import { pool } from "../config/db.js";

// Add Property
export const addProperty = async (property) => {
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      console.log("Property data being inserted:", property); // Added logging for debugging

      // Get all property fields from the model, excluding non-database fields
      const propertyFields = Object.keys(property).filter(
        (key) =>
          key !== "images" &&
          key !== "mainImage" &&
          key !== "replaceAllImages" &&
          key !== "replaceImages" &&
          key !== "image" // Exclude image field to prevent duplication
      );

      // Build dynamic query based on available properties
      const fieldNames = property.mainImage
        ? propertyFields.join(", ") + ", image"
        : propertyFields.join(", ");

      // Ensure image is only added once
      const placeholders = Array(
        propertyFields.length + (property.mainImage ? 1 : 0)
      )
        .fill("?")
        .join(", ");

      const query = `
        INSERT INTO properties 
        (${fieldNames}) 
        VALUES (${placeholders})`;

      // Create values array in the same order as fieldNames
      const values = propertyFields.map((field) => property[field]);

      // Add the main image if it exists
      if (property.mainImage) {
        values.push(property.mainImage);
      }

      console.log("SQL Query:", query);
      console.log("SQL Values:", values);

      const [result] = await connection.execute(query, values);
      const propertyId = result.insertId;

      // Add additional images if any
      if (property.images && property.images.length > 0) {
        const imageInsertQuery = `
          INSERT INTO property_images 
          (property_id, image_path, is_primary) 
          VALUES (?, ?, ?)`;

        for (let i = 0; i < property.images.length; i++) {
          const isPrimary = i === 0; // First image is primary
          await connection.execute(imageInsertQuery, [
            propertyId,
            property.images[i],
            isPrimary,
          ]);
        }
      }

      await connection.commit();
      connection.release();
      return {
        success: true,
        message: "Property added successfully",
        propertyId,
      };
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error adding property:", error);
    return { success: false, message: "Failed to add property" };
  }
};

// Get All Properties
export const getAllProperties = async (filters = {}) => {
  try {
    let baseQuery;
    const queryParams = [];
    const whereConditions = [];

    // Different query structure depending on user role and view
    if (filters.isAdmin) {
      // Admin/seller see all properties regardless of purchase status
      baseQuery = `
        SELECT p.*, 
        IFNULL(u.username, 'Admin') as owner_name, 
        IFNULL(p.owner_type, 'admin') as owner_type 
        FROM properties p
        LEFT JOIN users u ON p.owner_id = u.id
        WHERE 1=1`;
    } else {
      // Join with payments table to filter out purchased properties for public views
      baseQuery = `
        SELECT p.*, 
        IFNULL(u.username, 'Admin') as owner_name, 
        IFNULL(p.owner_type, 'admin') as owner_type 
        FROM properties p
        LEFT JOIN users u ON p.owner_id = u.id
        LEFT JOIN payments pm ON p.id = pm.property_id
        WHERE 1=1`;

      // Filter out purchased properties for public views unless explicitly viewing own properties
      if (!filters.viewOwnProperties) {
        baseQuery += ` AND pm.id IS NULL`;
      } else if (filters.userId) {
        // For dashboard view, only show properties purchased by this user
        baseQuery += ` AND (pm.user_id = ? OR pm.id IS NULL)`;
        queryParams.push(filters.userId);
      }
    }

    // Filter by owner_id if specified
    if (filters.owner_id) {
      whereConditions.push(`p.owner_id = ?`);
      queryParams.push(filters.owner_id);
    }

    // Apply filters if present
    if (Object.keys(filters).length > 0) {
      // Keyword search (search in name, description, location)
      if (filters.keyword) {
        whereConditions.push(`(
          p.name LIKE ? OR 
          p.description LIKE ? OR 
          p.location LIKE ?
        )`);
        const keywordPattern = `%${filters.keyword}%`;
        queryParams.push(keywordPattern, keywordPattern, keywordPattern);
      }

      // Property type filter
      if (filters.type) {
        whereConditions.push(`p.property_type = ?`);
        queryParams.push(filters.type);
      }

      // Price range filter
      if (filters.priceRange) {
        switch (filters.priceRange) {
          case "below_100k":
            whereConditions.push(`p.price < 100000`);
            break;
          case "100k_500k":
            whereConditions.push(`p.price >= 100000 AND p.price <= 500000`);
            break;
          case "500k_1m":
            whereConditions.push(`p.price > 500000 AND p.price <= 1000000`);
            break;
          case "above_1m":
            whereConditions.push(`p.price > 1000000`);
            break;
        }
      }

      // Bedrooms filter (minimum number)
      if (filters.bedrooms) {
        whereConditions.push(`p.bedrooms >= ?`);
        queryParams.push(parseInt(filters.bedrooms));
      }

      // Bathrooms filter (minimum number)
      if (filters.bathrooms) {
        whereConditions.push(`p.bathrooms >= ?`);
        queryParams.push(parseInt(filters.bathrooms));
      }

      // Area filter
      if (filters.area) {
        switch (filters.area) {
          case "below_1000":
            whereConditions.push(`p.area < 1000`);
            break;
          case "1000_3000":
            whereConditions.push(`p.area >= 1000 AND p.area <= 3000`);
            break;
          case "3000_5000":
            whereConditions.push(`p.area > 3000 AND p.area <= 5000`);
            break;
          case "above_5000":
            whereConditions.push(`p.area > 5000`);
            break;
        }
      }

      // Status filter
      if (filters.status) {
        whereConditions.push(`p.status = ?`);
        queryParams.push(filters.status);
      }

      // Furnishing filter
      if (filters.furnishing) {
        whereConditions.push(`p.furnishing = ?`);
        queryParams.push(filters.furnishing);
      }

      // Year built filter
      if (filters.year_built) {
        whereConditions.push(`p.year_built = ?`);
        queryParams.push(parseInt(filters.year_built));
      }

      // Floor number filter
      if (filters.floor_number) {
        whereConditions.push(`p.floor_number = ?`);
        queryParams.push(parseInt(filters.floor_number));
      }

      // Total floors filter
      if (filters.total_floors) {
        whereConditions.push(`p.total_floors = ?`);
        queryParams.push(parseInt(filters.total_floors));
      }

      // Parking spaces filter
      if (filters.parking_spaces) {
        whereConditions.push(`p.parking_spaces >= ?`);
        queryParams.push(parseInt(filters.parking_spaces));
      }
    }

    // Apply WHERE conditions if any
    if (whereConditions.length > 0) {
      baseQuery += ` AND ${whereConditions.join(" AND ")}`;
    }

    // Apply sorting
    let sortClause = " ORDER BY p.id DESC";
    if (filters.sort) {
      switch (filters.sort) {
        case "price_low_high":
          sortClause = " ORDER BY p.price ASC";
          break;
        case "price_high_low":
          sortClause = " ORDER BY p.price DESC";
          break;
        case "newest":
          sortClause = " ORDER BY p.id DESC";
          break;
        case "oldest":
          sortClause = " ORDER BY p.id ASC";
          break;
      }
    }

    baseQuery += sortClause;

    const [rows] = await pool.query(baseQuery, queryParams);
    return {
      success: true,
      message: "Properties retrieved successfully",
      data: rows,
    };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return {
      success: false,
      message: "Failed to retrieve properties",
    };
  }
};

// Get Property Images
export const getPropertyImages = async (propertyId) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, created_at ASC`,
      [propertyId]
    );
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error fetching property images:", error);
    return { success: false, message: "Failed to fetch property images" };
  }
};

// Update Property
export const updateProperty = async (id, updatedProperty) => {
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get database-relevant property fields, excluding control fields and computed fields
      const propertyFields = Object.keys(updatedProperty).filter(
        (key) =>
          key !== "images" &&
          key !== "newImages" &&
          key !== "mainImage" &&
          key !== "replaceAllImages" &&
          key !== "replaceImages" &&
          key !== "image" && // Exclude image field to prevent duplication
          key !== "owner_name" && // Exclude computed join field
          key !== "id" // Don't update the ID field
      );

      // Build SET clause dynamically
      const setClause = propertyFields.map((field) => `${field}=?`).join(", ");

      // Add image field if image exists
      const finalSetClause = updatedProperty.image
        ? `${setClause}${setClause ? ", " : ""}image=?`
        : setClause;

      const query = `
        UPDATE properties 
        SET ${finalSetClause} 
        WHERE id=?`;

      // Build values array in the same order as the SET clause
      const values = propertyFields.map((field) => updatedProperty[field]);

      // Add the image if it exists
      if (updatedProperty.image) {
        values.push(updatedProperty.image);
      }

      // Add the id as the last parameter
      values.push(id);

      await connection.execute(query, values);

      // Add new images if provided (using newImages from controller)
      if (updatedProperty.newImages && updatedProperty.newImages.length > 0) {
        // First, delete existing images if replaceAllImages is true
        if (updatedProperty.replaceAllImages) {
          await connection.execute(
            `DELETE FROM property_images WHERE property_id = ?`,
            [id]
          );
        }

        const imageInsertQuery = `
          INSERT INTO property_images 
          (property_id, image_path, is_primary) 
          VALUES (?, ?, ?)`;

        for (let i = 0; i < updatedProperty.newImages.length; i++) {
          // First image is primary only if replacing all images or no images exist
          const isPrimary = i === 0 && updatedProperty.replaceAllImages;
          await connection.execute(imageInsertQuery, [
            id,
            updatedProperty.newImages[i],
            isPrimary,
          ]);
        }
      }

      await connection.commit();
      connection.release();
      return { success: true, message: "Property updated successfully" };
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error updating property:", error);
    return { success: false, message: "Failed to update property" };
  }
};

// Delete Property
export const deleteProperty = async (id) => {
  try {
    // Property images will be automatically deleted due to the CASCADE constraint
    await pool.execute(`DELETE FROM properties WHERE id=?`, [id]);
    return { success: true, message: "Property deleted successfully" };
  } catch (error) {
    console.error("Error deleting property:", error);
    return { success: false, message: "Failed to delete property" };
  }
};

// Delete a specific property image
export const deletePropertyImage = async (imageId) => {
  try {
    const [result] = await pool.execute(
      `DELETE FROM property_images WHERE id = ?`,
      [imageId]
    );
    if (result.affectedRows > 0) {
      return { success: true, message: "Image deleted successfully" };
    } else {
      return { success: false, message: "Image not found" };
    }
  } catch (error) {
    console.error("Error deleting property image:", error);
    return { success: false, message: "Failed to delete property image" };
  }
};

// Set an image as the primary image
export const setPrimaryImage = async (imageId, propertyId) => {
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Reset is_primary for all images of this property
      await connection.execute(
        `UPDATE property_images SET is_primary = FALSE WHERE property_id = ?`,
        [propertyId]
      );

      // Set the selected image as primary
      await connection.execute(
        `UPDATE property_images SET is_primary = TRUE WHERE id = ?`,
        [imageId]
      );

      // Update the main image in the properties table
      const [rows] = await connection.execute(
        `SELECT image_path FROM property_images WHERE id = ?`,
        [imageId]
      );

      if (rows.length > 0) {
        await connection.execute(
          `UPDATE properties SET image = ? WHERE id = ?`,
          [rows[0].image_path, propertyId]
        );
      }

      await connection.commit();
      connection.release();
      return { success: true, message: "Primary image updated successfully" };
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error setting primary image:", error);
    return { success: false, message: "Failed to set primary image" };
  }
};
