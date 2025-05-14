import PropertyModel from "../models/propertyModel.js";
import {
  addProperty,
  getAllProperties,
  updateProperty,
  deleteProperty,
  getPropertyImages,
  deletePropertyImage,
  setPrimaryImage,
} from "../services/propertyService.js";
import fs from "fs";

// Add Property
export const createProperty = async (req, res) => {
  try {
    const {
      name,
      location,
      price,
      bedrooms,
      bathrooms,
      area,
      description,
      property_type,
      status,
      furnishing,
      year_built,
      floor_number,
      total_floors,
      parking_spaces,
      ...additionalProperties
    } = req.body;

    if (
      !name ||
      !location ||
      !price ||
      !bedrooms ||
      !bathrooms ||
      !area ||
      !description ||
      !property_type ||
      !status ||
      !furnishing ||
      !year_built ||
      !floor_number ||
      !total_floors ||
      !parking_spaces
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    let mainImage = null;
    const imagePaths = [];

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        imagePaths.push(file.path);
      });
      mainImage = req.files[0].path;
    }

    // Set owner_id and owner_type from authenticated user
    let owner_id = null;
    let owner_type = "admin"; // Default to admin

    // If user is authenticated, set the owner properties
    if (req.user) {
      owner_id = req.user.id;
      // Set owner_type based on user role
      owner_type = req.user.role === "seller" ? "seller" : "admin";
      console.log("User authenticated:", req.user);
      console.log("Setting owner_id to:", owner_id);
      console.log("Setting owner_type to:", owner_type);
    } else {
      console.log("No authenticated user found in request");
    }

    // Combine all properties into a single object
    const propertyData = {
      name,
      location,
      price,
      bedrooms,
      bathrooms,
      area,
      description,
      property_type,
      status,
      furnishing,
      year_built,
      floor_number,
      total_floors,
      parking_spaces,
      mainImage,
      images: imagePaths,
      owner_id, // Set from authenticated user
      owner_type, // Set based on user role
      ...additionalProperties,
    };

    console.log("Final property data being sent to model:", {
      ...propertyData,
      owner_id,
      owner_type,
    });

    const property = new PropertyModel(propertyData);

    const response = await addProperty(property);
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error creating property:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get All Properties
export const fetchProperties = async (req, res) => {
  try {
    const filters = {};
    const filterFields = [
      "keyword",
      "type",
      "priceRange",
      "bedrooms",
      "bathrooms",
      "area",
      "status",
      "sort",
      "furnishing",
      "year_built",
      "floor_number",
      "total_floors",
      "parking_spaces",
    ];

    filterFields.forEach((field) => {
      if (req.query[field]) {
        filters[field] = req.query[field];
      }
    });

    if (req.query.keyword) {
      filters.keyword = req.query.keyword;
    }

    // Allow all properties to be fetched (no admin/seller restriction)
    if (req.query.isAdmin === "true") {
      filters.isAdmin = true;
    }

    // Remove viewOwnProperties logic since no user authentication
    console.log("Applied filters:", filters);

    const response = await getAllProperties(filters);
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Property Images
export const fetchPropertyImages = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await getPropertyImages(id);
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error fetching property images:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Property
export const modifyProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = { ...req.body };

    // Remove validation that prevents updates with empty fields
    // Some fields might legitimately be empty or false
    // Only check if the required fields exist rather than having values
    if (!updatedData) {
      return res
        .status(400)
        .json({ success: false, message: "No update data provided" });
    }

    const currentProps = await getAllProperties();
    const property = currentProps.data.find((p) => p.id === parseInt(id));

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    // Check if the user is authorized to modify this property
    if (req.user && req.user.role !== "admin") {
      // Only owner or admin can modify
      if (property.owner_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to modify this property",
        });
      }
    }

    // Preserve the existing owner_id and owner_type
    updatedData.owner_id = property.owner_id;
    updatedData.owner_type = property.owner_type;

    // Use existing image from property if not being replaced
    // Only override if there are new uploads or replacement is requested
    const newImagePaths = [];

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        newImagePaths.push(file.path);
      });

      // Set the main image if it's being replaced or doesn't exist
      if (
        req.files.length > 0 &&
        (updatedData.replaceAllImages || !property.image)
      ) {
        updatedData.image = req.files[0].path;
      }

      if (newImagePaths.length > 0) {
        updatedData.newImages = newImagePaths;
      }
    } else {
      // Preserve existing image if no new image is uploaded
      updatedData.image = property.image;
    }

    const response = await updateProperty(id, updatedData);
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Property
export const removeProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const currentProps = await getAllProperties();
    const property = currentProps.data.find((p) => p.id === parseInt(id));

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    // Check if the user is authorized to delete this property
    if (req.user && req.user.role !== "admin") {
      // Only owner or admin can delete
      if (property.owner_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to delete this property",
        });
      }
    }

    const imagesResponse = await getPropertyImages(id);
    const images = imagesResponse.success ? imagesResponse.data : [];

    const response = await deleteProperty(id);

    if (response.success) {
      if (property && property.image && fs.existsSync(property.image)) {
        try {
          fs.unlinkSync(property.image);
        } catch (error) {
          console.error("Error deleting property main image:", error);
        }
      }

      if (images.length > 0) {
        images.forEach((image) => {
          if (image.image_path && fs.existsSync(image.image_path)) {
            try {
              fs.unlinkSync(image.image_path);
            } catch (error) {
              console.error(
                `Error deleting property image ${image.id}:`,
                error
              );
            }
          }
        });
      }
    }

    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Property Image
export const removePropertyImage = async (req, res) => {
  try {
    const { id } = req.params;

    const imagesRes = await getPropertyImages(id);
    if (imagesRes.success && imagesRes.data) {
      const image = imagesRes.data.find((img) => img.id === parseInt(id));

      if (image && image.image_path && fs.existsSync(image.image_path)) {
        try {
          fs.unlinkSync(image.image_path);
        } catch (error) {
          console.error("Error deleting image file:", error);
        }
      }
    }

    const response = await deletePropertyImage(id);
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error deleting property image:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Set Primary Image
export const updatePrimaryImage = async (req, res) => {
  try {
    const { imageId, propertyId } = req.body;

    if (!imageId || !propertyId) {
      return res.status(400).json({
        success: false,
        message: "Image ID and Property ID are required",
      });
    }

    const response = await setPrimaryImage(imageId, propertyId);
    return res.status(response.success ? 200 : 400).json(response);
  } catch (error) {
    console.error("Error setting primary image:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch Property Columns
export const fetchPropertyColumns = async (req, res) => {
  try {
    const columns = [
      { name: "name", type: "string", label: "Name" },
      { name: "location", type: "string", label: "Location" },
      { name: "price", type: "number", label: "Price" },
      { name: "bedrooms", type: "number", label: "Bedrooms" },
      { name: "bathrooms", type: "number", label: "Bathrooms" },
      { name: "area", type: "number", label: "Area (sq.ft)" },
      { name: "description", type: "text", label: "Description" },
      { name: "type", type: "string", label: "Property Type" },
      { name: "status", type: "string", label: "Status" },
      { name: "furnishing", type: "string", label: "Furnishing" },
      { name: "year_built", type: "number", label: "Year Built" },
      { name: "floor_number", type: "number", label: "Floor Number" },
      { name: "total_floors", type: "number", label: "Total Floors" },
      { name: "parking_spaces", type: "number", label: "Parking Spaces" },
    ];

    res.status(200).json({
      success: true,
      columns: columns,
    });
  } catch (error) {
    console.error("Error in fetchPropertyColumns:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch property columns",
      error: error.message,
    });
  }
};
