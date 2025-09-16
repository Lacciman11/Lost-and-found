const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const { reportFoundItem } = require("../controllers/foundItemController");

router.post("/report-found", upload.single("image"), reportFoundItem);

module.exports = router;
