const LostItem = require("../models/LostItem");

// Report a lost item
const reportLostItem = async (req, res) => {
  try {
    const { itemName, location, description, contact } = req.body;
    const imageUrl = req.file ? req.file.path : null; // Cloudinary returns .path as the URL

    const newLostItem = new LostItem({
      itemName,
      location,
      description,
      contact,
      imageUrl,
    });

    await newLostItem.save();

    res.status(201).json({
      message: "Lost item reported successfully",
      lostItem: newLostItem,
    });
  } catch (error) {
    console.error("Error reporting lost item:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { reportLostItem };
