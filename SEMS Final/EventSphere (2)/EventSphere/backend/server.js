import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { sendEmail } from "./utils/email.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import rsvpRoutes from "./routes/rsvpRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
connectDB();

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Event Sphere Backend is Running 🚀");
});

// ✅ API routes

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/rsvps", rsvpRoutes);

// ✅ Test email route
app.get("/test-email", async (req, res) => {
  try {
    await sendEmail("receiver@example.com", "Test Email", "Hello from Event Sphere!");
    res.send("✅ Test email sent successfully!");
  } catch (err) {
    console.error("❌ Error sending email:", err);
    res.status(500).send("Email failed to send");
  }
});

// ✅ Server run + localhost link show kare
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}/`);
  console.log(`📧 Test Email Route: http://localhost:${PORT}/test-email`);
});
