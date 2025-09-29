const Lost = require("../models/LostItem.js");
const Found = require("../models/FoundItem.js");

/**
 * @desc Get latest items across Lost + Found
 */
const getRecentItems = async (req, res) => {
    try {
      const lostItems = await Lost.find().sort({ createdAt: -1 }).limit(2);
      const foundItems = await Found.find().sort({ createdAt: -1 }).limit(2);
  
      res.status(200).json({
        lost: lostItems,
        found: foundItems
      });
    } catch (error) {
      res.status(500).json({ error: "Server error", details: error.message });
    }
  };
  
  module.exports = { getRecentItems };
  

/**
 * @desc Get latest activity messages across Lost + Found
 */
const getRecentActivities = async (req, res) => {
  try {
    const lostItems = await Lost.find().sort({ createdAt: -1 }).limit(2);
    const foundItems = await Found.find().sort({ createdAt: -1 }).limit(2);

    const combined = [...lostItems, ...foundItems].sort(
      (a, b) => b.createdAt - a.createdAt
    );

    const activities = combined.slice(0, 4).map((item) => ({
      message: item instanceof Lost
        ? `📢 Lost item reported: ${item.itemName} at ${item.location}`
        : `🎉 Found item reported: ${item.itemName} at ${item.location}`,
      time: item.createdAt,
    }));

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

/**
 * @desc Search items across Lost + Found
 */
const searchItems = async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) return res.status(400).json({ error: "Query is required" });
  
      const lostItems = await Lost.find({
        $or: [
          { itemName: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { location: { $regex: query, $options: "i" } },
        ],
      }).lean(); // use lean() so we can add fields easily
  
      const foundItems = await Found.find({
        $or: [
          { itemName: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { location: { $regex: query, $options: "i" } },
        ],
      }).lean();
  
      // Add "type" field so frontend knows where each item came from
      const formattedLost = lostItems.map(item => ({ ...item, type: "lost" }));
      const formattedFound = foundItems.map(item => ({ ...item, type: "found" }));
  
      const combined = [...formattedLost, ...formattedFound].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
  
      res.status(200).json(combined);
    } catch (error) {
      res.status(500).json({ error: "Server error", details: error.message });
    }
  };

  const getItems = async (req, res) => {
    try {
      const lostItems = await Lost.find();
      const foundItems = await Found.find();
  
      // Send in the requested format
      res.status(200).json([
        { lost: lostItems },
        { found: foundItems }
      ]);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  
module.exports = {
  getRecentItems,
  getRecentActivities,
  searchItems,
  getItems,
};
