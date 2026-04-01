import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import webhookRoutes from "./routes/webhook.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();

// Connect Database
connectDB();

// ✅ 1. CORS FIRST (before routes)
const allowedOrigins = [
  "http://localhost:5173",
  "https://soft-cuts.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / mobile apps
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

// ✅ 2. Built-in body parsers (NO body-parser needed)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(bodyParser.json());

// ✅ 3. Routes
app.use("/webhook", webhookRoutes);
app.use("/api/admin", adminRoutes);

// ✅ 4. Health check
app.get("/", (req, res) => {
  res.send("API running...");
});

// ✅ 5. Start server LAST
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});