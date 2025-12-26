const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const herbRoutes = require("./routes/herbRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/herbs", herbRoutes);
app.use("/api/auth", authRoutes);

// DB
connectDB();

// server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
