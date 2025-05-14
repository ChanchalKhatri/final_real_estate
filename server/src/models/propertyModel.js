class PropertyModel {
  constructor(property) {
    // Dynamically add all properties from the input object
    Object.keys(property).forEach((key) => {
      this[key] = property[key];
    });

    // Ensure essential properties are always set
    this.name = property.name || "";
    this.location = property.location || "";
    this.price = property.price || 0;
    this.bedrooms = property.bedrooms || 0;
    this.bathrooms = property.bathrooms || 0;
    this.area = property.area || 0;
    this.image = property.image || null;
    this.description = property.description || "";
    this.property_type = property.property_type || "apartment";
    this.status = property.status || "for_sale";
    this.furnishing = property.furnishing || "unfurnished";
    this.year_built = property.year_built || 0;
    this.floor_number = property.floor_number || 0;
    this.total_floors = property.total_floors || 0;
    this.parking_spaces = property.parking_spaces || 0;

    // Explicitly set owner_id and owner_type to avoid null/undefined issues
    // Use null for owner_id if not provided (will be stored as NULL in database)
    this.owner_id = property.owner_id !== undefined ? property.owner_id : null;
    // Default owner_type to 'admin' if not provided
    this.owner_type = property.owner_type || "admin"; // Can be "seller" or "admin"
  }
}

export default PropertyModel;
