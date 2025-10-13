// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { findUserById } from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from DB without password
      req.user = await findUserById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next();
    }

    return res.status(401).json({ message: "Not authorized, no token" });
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
