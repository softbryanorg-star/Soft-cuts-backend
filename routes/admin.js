import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getBookings,
  changePassword,
} from "../controllers/adminController.js";

import { protect } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// REGISTER (protected with secret key)
router.post("/register", registerAdmin);

// LOGIN (rate limited)
router.post("/login", loginLimiter, loginAdmin);

// CHANGE PASSWORD (protected + rate limited)
router.put("/change-password", protect, loginLimiter, changePassword);

// BOOKINGS
router.get("/bookings", protect, getBookings);

export default router;