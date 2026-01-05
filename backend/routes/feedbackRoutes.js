const express = require("express");
const Feedback = require("../models/Feedback");
const XLSX = require("xlsx");

const router = express.Router();

// ---------------- POST /api/feedback ----------------
router.post("/", async (req, res) => {
  const { name, email, feedback } = req.body;

  if (!name || !email || !feedback) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newFeedback = await Feedback.create({ name, email, feedback });
    res.status(201).json({
      message: "Feedback submitted successfully!",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ---------------- GET /api/feedback ----------------
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ---------------- GET /api/feedback/download ----------------
router.get("/download", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });

    // Prepare Excel data
    const data = feedbacks.map((f, index) => ({
      "S.No.": index + 1,
      Name: f.name,
      Email: f.email,
      Feedback: f.feedback,
      Date: f.createdAt.toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feedbacks");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=feedbacks.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate Excel" });
  }
});

module.exports = router;
