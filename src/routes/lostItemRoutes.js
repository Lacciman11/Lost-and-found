const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const { reportLostItem } = require("../controllers/lostItemController");

router.post("/report-lost", upload.single("image"), reportLostItem);

module.exports = router;
