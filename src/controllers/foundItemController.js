const FoundItem = require("../models/FoundItem");
const cloudinary = require("../dbConnection/cloudinary"); // make sure you exported config

// Report a found item
const reportFoundItem = async (req, res) => {
  try {
    const { itemName, location, description, contact } = req.body;

    let imageUrl = null;

    if (req.file) {
      try {
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "found_items", // optional folder in Cloudinary
        });
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(500).json({
          error: "Image upload failed",
          details: uploadError.message,
        });
      }
    }

    const newFoundItem = new FoundItem({
      itemName,
      location,
      description,
      contact,
      imageUrl,
    });

    await newFoundItem.save();

    res.status(201).json({
      message: "Found item reported successfully",
      foundItem: newFoundItem,
    });
  } catch (error) {
    console.error("Error reporting found item:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

module.exports = { reportFoundItem };
