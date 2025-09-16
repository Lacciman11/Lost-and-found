const mongoose = require("mongoose");

const foundItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    contact: { type: String, required: true },
    imageUrl: { type: String }, // Cloudinary URL
  },
  { timestamps: true }
);

module.exports = mongoose.model("FoundItem", foundItemSchema);
