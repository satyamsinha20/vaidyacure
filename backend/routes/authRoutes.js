const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

// 🔐 Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, userPin } = req.body;

    if (!email || !password || !userPin) {
      return res.status(400).json({ message: "All fields required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (admin.userPin !== userPin) {
      return res.status(400).json({ message: "Invalid user pin" });
    }

    const token = jwt.sign(
      { id: admin._id, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      name: admin.name,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
