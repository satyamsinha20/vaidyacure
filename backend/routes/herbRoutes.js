const express = require("express");
const Herb = require("../models/Herb");
const multer = require("multer");
const cloudinary = require("../config/cloudinary"); // Cloudinary config
const router = express.Router();

// Multer setup to store file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ----------------- POST: Add Herb -----------------
router.post("/", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";

    // Upload image to Cloudinary if file exists
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`,
        { folder: "VaidyaCure/herbs" } // ✅ nested folder
      );
      imageUrl = result.secure_url;
    }

    const herb = new Herb({
      ...req.body,
      benefit: req.body.benefit.split(","),
      sideEffect: req.body.sideEffect?.split(",") || [],
      health: req.body.health?.split(",") || [],
      symptoms: req.body.symptoms.split(","),
      process: req.body.process.split("\n"),
      imageUrl,
    });

    const savedHerb = await herb.save();
    res.status(201).json(savedHerb);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Herb save failed", error: error.message });
  }
});

// ----------------- GET: List Herbs -----------------
router.get("/", async (req, res) => {
  try {
    const { symptom } = req.query;

    let herbs;
    if (symptom && symptom !== "all") {
      herbs = await Herb.find({ symptoms: symptom });
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
        { folder: "VaidyaCure/herbs" } // ✅ nested folder
      );
      imageUrl = result.secure_url;
    }

    const updatedHerb = await Herb.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        benefit: req.body.benefit.split(","),
        sideEffect: req.body.sideEffect?.split(",") || [],
        health: req.body.health?.split(",") || [],
        symptoms: req.body.symptoms.split(","),
        process: req.body.process.split("\n"),
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
