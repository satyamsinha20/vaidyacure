const express = require("express");
const Herb = require("../models/Herb");
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

// ----------------- POST: Add Herb -----------------
router.post("/", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`,
        { folder: "VaidyaCure/herbs" }
      );
      imageUrl = result.secure_url;
    }

    const herb = new Herb({
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
      imageUrl,
    });

    const savedHerb = await herb.save();
    res.status(201).json(savedHerb);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Herb save failed", error: error.message });
  }
});

// ----------------- GET: List Herbs (with filter) -----------------
router.get("/", async (req, res) => {
  try {
    const { symptom } = req.query;

    let herbs;
    if (symptom && symptom !== "all") {
      herbs = await Herb.find({
        symptoms: { $in: [symptom.toLowerCase()] },
      });
    } else {
      herbs = await Herb.find();
    }

    res.json(herbs);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// ----------------- PUT: Update Herb -----------------
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl || "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`,
        { folder: "VaidyaCure/herbs" }
      );
      imageUrl = result.secure_url;
    }

    const updatedHerb = await Herb.findByIdAndUpdate(
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
        imageUrl,
      },
      { new: true }
    );

    res.json(updatedHerb);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Update failed", error: err.message });
  }
});

// ----------------- DELETE: Remove Herb -----------------
router.delete("/:id", async (req, res) => {
  try {
    await Herb.findByIdAndDelete(req.params.id);
    res.json({ message: "Herb deleted" });
  } catch (err) {
    res.status(400).json({ message: "Delete failed" });
  }
});

module.exports = router;
