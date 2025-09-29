const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken"); 
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const winston  = require("winston")


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
// Set up logging
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log' }),
  ],
});

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token + expiry in DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const backendUrl = process.env.BACKEND_URL || 'https://lost-and-found-epjk.onrender.com';
    const resetUrl = `${backendUrl}/api/auth/reset-password/${resetToken}`;

    // Send email
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 15000, // Increased to 15 seconds
      greetingTimeout: 15000,
      socketTimeout: 15000,
      dnsTimeout: 15000,
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
      },
    });

    // Verify SMTP connection
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          logger.error('SMTP verification failed:', error);
          reject(error);
        } else {
          logger.info('SMTP server is ready to send emails');
          resolve(success);
        }
      });
    });

    const mailOptions = {
      from: `"Lost & Found" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>Hello ${user.fullName},</p>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it (valid for 1 hour):</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${user.email}`);

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    logger.error('Forgot Password Error:', err);
    if (err.code === 'EAI_AGAIN') {
      return res.status(500).json({ error: 'Failed to send email due to DNS resolution failure. Please try again later.' });
    }
    if (err.code === 'ETIMEDOUT') {
      return res.status(500).json({ error: 'Failed to send email due to connection timeout. Please try again later.' });
    }
    if (err.code === 'EAUTH') {
      return res.status(500).json({ error: 'Failed to authenticate with email server. Please try again later.' });
    }
    res.status(500).json({ error: 'Failed to send reset email. Please try again.', details: err.message });
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