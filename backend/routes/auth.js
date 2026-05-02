const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// 🔹 SIGNUP
router.post("/signup", async (req, res) => {
  try {
   const { name, email, password, role } = req.body;

// 🔥 SAFE ROLE CHECK
const safeRole = ["Admin", "Member"].includes(role)
  ? role
  : "Member";

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
  name,
  email,
  password: hashedPassword,
  role: safeRole, // 🔥 USE SAFE ROLE
});
    res.json({ msg: "User registered successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// 🔹 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // 🔥 CREATE TOKEN (IMPORTANT PART)
   const token = jwt.sign(
  {
    id: user._id,
    name: user.name,
    email: user.email,   // 🔥 ADD THIS LINE
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    res.json({ token });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;