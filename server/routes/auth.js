// import express from "express";
// import jwt from "jsonwebtoken";
// import {
//   createUser,
//   findUserByEmail,
//   matchPassword,
// } from "../models/User.js";

// const router = express.Router();

// // Register
// router.post("/register", async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     // Check if user exists
//     const existingUser = await findUserByEmail(email);
//     if (existingUser) {
//       return res.status(400).json({ error: "User already exists" });
//     }

//     // Create new user
//     const userId = await createUser({ name, email, password, role: "User" });

//     res.json({
//       message: "User registered",
//       user: { id: userId, email, role: "User" },
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Login
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await findUserByEmail(email);
//     if (!user) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     // Compare passwords
//     const isMatch = await matchPassword(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user._id.toString(), role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({
//       token,
//       user: { id: user._id, email: user.email, role: user.role },
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;

import express from "express";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  matchPassword,
} from "../models/User.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const userId = await createUser({ name, email, password, role: "User" });

    res.json({
      message: "User registered",
      user: { id: userId, email, role: "User" },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await matchPassword(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
