import Admin from "../models/Admin.js";
import Booking from "../models/Booking.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  recordFailedAttempt,
  resetAttempts,
} from "../middleware/rateLimiter.js";

// TOKEN
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

//
// 🔐 REGISTER (PROTECTED)
//
export const registerAdmin = async (req, res) => {
  const { email, password, secretKey } = req.body;

  // Check secret key
  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // Prevent multiple admins
  const existingAdmin = await Admin.findOne();
  if (existingAdmin) {
    return res.status(403).json({ message: "Admin already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await Admin.create({
    email,
    password: hashedPassword,
  });

  res.json({
    _id: admin._id,
    email: admin.email,
    token: generateToken(admin._id),
  });
};

//
// 🔐 LOGIN (RATE LIMITED)
//
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;

  const admin = await Admin.findOne({ email });

  if (admin && (await bcrypt.compare(password, admin.password))) {
    resetAttempts(ip);

    return res.json({
      _id: admin._id,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } else {
    recordFailedAttempt(ip);

    return res.status(401).json({ message: "Invalid credentials" });
  }
};

//
// 🔐 CHANGE PASSWORD (PROTECTED + RATE LIMITED)
//
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const ip = req.ip;

  const admin = await Admin.findById(req.admin.id);

  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  const isMatch = await bcrypt.compare(oldPassword, admin.password);

  if (!isMatch) {
    recordFailedAttempt(ip);
    return res.status(401).json({ message: "Old password incorrect" });
  }

  resetAttempts(ip);

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  admin.password = hashedPassword;
  await admin.save();

  res.json({ message: "Password updated successfully" });
};

//
// 📊 GET BOOKINGS
//
export const getBookings = async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json(bookings);
};