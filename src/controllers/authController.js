const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken"); 
const crypto = require("crypto");
const nodemailer = require("nodemailer");


// @desc Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};



exports.loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if fields are filled
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }
  
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Invalid email or password." });
      }
  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid email or password." });
      }
  
      // Generate JWT
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "3d" }
      );
  
      // Send token + redirect
      res.status(200).json({
        message: "Login successful!",
        token,
        redirect: "http://127.0.0.1:5500/project.html"
      });
  
    } catch (err) {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  };


// @desc Forgot Password - Send reset link to email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving (for security)
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save token + expiry in DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const backendUrl = process.env.BACKEND_URL ;
    // Reset URL (frontend reset page served by your server)
    const resetUrl = `${backendUrl}/api/auth/reset-password/${resetToken}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail", // you can use others like Mailgun, Outlook
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Lost & Found" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.fullName},</p>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it (valid for 1 hour):</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to email." });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // 1. Validate input
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 3. Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update user password
    user.password = hashedPassword;
    await user.save();

    // 5. Respond
    res.status(200).json({ message: "Password reset successful. Please login with your new password." });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error" });
  }
};