const express = require("express");
const router = express.Router();
const path = require("path");
const { registerUser,loginUser,forgotPassword,resetPassword } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/reset-password/:token", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/Reset-password.html"));
  });


module.exports = router;
