import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import connectDB from "./config/db.js";
import webhookRoutes from "./routes/webhook.js";
import adminRoutes from "./routes/admin.js"; // ✅ IMPORTANT

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use("/webhook", webhookRoutes);       // WhatsApp webhook
app.use("/api/admin", adminRoutes);       // ✅ ADMIN ROUTES FIXED


// Health check
app.get("/", (req, res) => {
  res.send("API running...");
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


//✅ 1. Enable CORS before everything else
 const allowedOrigins = [
  "http://localhost:5173",
];
  
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // mobile apps, Postman
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); 



