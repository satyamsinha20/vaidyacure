const express = require("express");
const Homeopathy = require("../models/Homeopath");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🔥 helper to normalize comma-separated fields
const normalizeArray = (value = "") =>
  value
    .split(",")
    .map(v => v.trim().toLowerCase())
    .filter(Boolean);

// ----------------- POST: Add Homeopathy -----------------
router.post("/", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`,
        { folder: "VaidyaCure/homeopathy" }
      );
      imageUrl = result.secure_url;
    }

    const remedy = new Homeopathy({
      name: req.body.name,
      description: req.body.description,
      benefit: normalizeArray(req.body.benefit),
      sideEffect: normalizeArray(req.body.sideEffect),
      health: normalizeArray(req.body.health),
      symptoms: normalizeArray(req.body.symptoms),
      process: req.body.process
        .split("\n")
        .map(p => p.trim())
        .filter(Boolean),
      potency: req.body.potency,
      imageUrl,
    });

    const savedRemedy = await remedy.save();
    res.status(201).json(savedRemedy);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Homeopathy save failed", error: error.message });
  }
});

// ----------------- GET: List Homeopathy Remedies (with filter) -----------------
router.get("/", async (req, res) => {
  try {
    const { symptom } = req.query;

    let remedies;
    if (symptom && symptom !== "all") {
      remedies = await Homeopathy.find({
        symptoms: { $in: [symptom.toLowerCase()] },
      });
    } else {
      remedies = await Homeopathy.find();
    }

    res.json(remedies);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// ----------------- PUT: Update Homeopathy -----------------
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl || "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`,
        { folder: "VaidyaCure/homeopathy" }
      );
      imageUrl = result.secure_url;
    }

    const updatedRemedy = await Homeopathy.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        benefit: normalizeArray(req.body.benefit),
        sideEffect: normalizeArray(req.body.sideEffect),
        health: normalizeArray(req.body.health),
        symptoms: normalizeArray(req.body.symptoms),
        process: req.body.process
          .split("\n")
          .map(p => p.trim())
          .filter(Boolean),
        potency: req.body.potency,
        imageUrl,
      },
      { new: true }
    );

    res.json(updatedRemedy);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Update failed", error: err.message });
  }
});

// ----------------- DELETE: Remove Homeopathy -----------------
router.delete("/:id", async (req, res) => {
  try {
    await Homeopathy.findByIdAndDelete(req.params.id);
    res.json({ message: "Homeopathy remedy deleted" });
  } catch (err) {
    res.status(400).json({ message: "Delete failed" });
  }
});

module.exports = router;
