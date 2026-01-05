const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const herbRoutes = require("./routes/herbRoutes");
const homeopathyRoutes = require("./routes/homeopathyRoutes");
const authRoutes = require("./routes/authRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes"); // ✅ new
const allopathRoutes = require("./routes/allopathRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/herbs", herbRoutes);
app.use("/api/allopath", allopathRoutes);
app.use("/api/homeopathy", homeopathyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes); // ✅ feedback routes

// DB
connectDB();

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
