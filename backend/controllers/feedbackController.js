const Feedback = require("../models/Feedback");

// @desc   Submit feedback
// @route  POST /api/feedback
// @access Public
const submitFeedback = async (req, res) => {
  const { name, email, feedback } = req.body;

  if (!name || !email || !feedback) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newFeedback = await Feedback.create({ name, email, feedback });
    res.status(201).json({ message: "Feedback submitted successfully!", feedback: newFeedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc   Get all feedbacks
// @route  GET /api/feedback
// @access Public (or admin only)
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { submitFeedback, getFeedbacks };
