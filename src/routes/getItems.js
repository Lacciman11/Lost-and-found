const express = require("express");
const {
  getRecentItems,
  getRecentActivities,
  searchItems,
} = require("../controllers/getItems.controller");

const router = express.Router();

router.get("/recent", getRecentItems);
router.get("/activity/recent", getRecentActivities);
router.get("/search", searchItems);

module.exports = router;
