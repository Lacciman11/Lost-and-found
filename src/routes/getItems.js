const express = require("express");
const {
  getRecentItems,
  getRecentActivities,
  searchItems,
  getItems,
} = require("../controllers/getItems.controller");

const router = express.Router();

router.get("/recent", getRecentItems);
router.get("/activity/recent", getRecentActivities);
router.get("/search", searchItems);
router.get("/getAllItems",getItems)

module.exports = router;
