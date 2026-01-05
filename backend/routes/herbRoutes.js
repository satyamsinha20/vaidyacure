const express = require("express");
const Herb = require("../models/Herb");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const csv = require("csv-parser");
const XLSX = require("xlsx");
const stream = require("stream");

const router = express.Router();

// ---------------- MULTER ----------------
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------- HELPERS ----------------
const normalizeArray = (value = "") =>
  value
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

// ---------------- GET ALL HERBS ----------------
router.get("/", async (req, res) => {
  try {
    const { symptom } = req.query;

    let herbs;
    if (symptom && symptom.trim() && symptom !== "all") {
      herbs = await Herb.find({
        symptoms: { $in: [symptom.toLowerCase()] },
      });
    } else {
      herbs = await Herb.find();
    }

    res.json(herbs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ---------------- ADD HERB ----------------
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
        ? req.body.process.split("\n").map((p) => p.trim()).filter(Boolean)
        : ["general usage"],
      imageUrl,
    });

    res.status(201).json(await herb.save());
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Herb save failed" });
  }
});

// ---------------- UPDATE HERB ----------------
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const herb = await Herb.findById(req.params.id);
    if (!herb) return res.status(404).json({ message: "Herb not found" });

    herb.name = req.body.name || herb.name;
    herb.description = req.body.description || herb.description;
    herb.benefit = req.body.benefit
      ? normalizeArray(req.body.benefit)
      : herb.benefit;
    herb.sideEffect = req.body.sideEffect
      ? normalizeArray(req.body.sideEffect)
      : herb.sideEffect;
    herb.health = req.body.health
      ? normalizeArray(req.body.health)
      : herb.health;
    herb.symptoms = req.body.symptoms
      ? normalizeArray(req.body.symptoms)
      : herb.symptoms;
    herb.process = req.body.process
      ? req.body.process.split("\n").map((p) => p.trim()).filter(Boolean)
      : herb.process;

    // Update image if new file uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`,
        { folder: "VaidyaCure/herbs" }
      );
      herb.imageUrl = result.secure_url;
    } else if (req.body.imageUrl) {
      herb.imageUrl = req.body.imageUrl;
    }

    const updated = await herb.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Herb update failed" });
  }
});

// ---------------- BULK UPLOAD ----------------
router.post("/bulk-upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });

    const saveHerbs = async (rows) => {
      for (const row of rows) {
        // Skip invalid rows
        if (!row.name || !row.description) continue;

        await new Herb({
          name: row.name,
          description: row.description,
          benefit: normalizeArray(row.benefit),
          sideEffect: normalizeArray(row.sideEffect),
          health: normalizeArray(row.health),
          symptoms: normalizeArray(row.symptoms),
          process:
            row.process && row.process.trim()
              ? row.process.split("\n").map((p) => p.trim()).filter(Boolean)
              : ["general usage"],
          imageUrl: row.imageUrl || "",
        }).save();
      }
    };

    // CSV
    if (req.file.originalname.endsWith(".csv")) {
      const results = [];
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);

      bufferStream
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          await saveHerbs(results);
          res.json({ message: "CSV uploaded successfully" });
        });
      return;
    }

    // EXCEL
    if (req.file.originalname.endsWith(".xlsx")) {
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      await saveHerbs(data);
      return res.json({ message: "Excel uploaded successfully" });
    }

    res.status(400).json({ message: "Unsupported file type" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Bulk upload failed" });
  }
});
// ---------------- DELETE HERB ----------------
router.delete("/:id", async (req, res) => {
  try {
    const herb = await Herb.findById(req.params.id);
    if (!herb) return res.status(404).json({ message: "Herb not found" });

    await herb.deleteOne();
    res.json({ message: "Herb deleted successfully 🌿" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete herb" });
  }
});

// ---------------- DOWNLOAD ALL HERBS AS EXCEL ----------------
router.get("/download", async (req, res) => {
  try {
    const herbs = await Herb.find();

    const XLSX = require("xlsx");
    const data = herbs.map((h) => ({
      name: h.name,
      description: h.description,
      benefit: h.benefit.join(", "),
      sideEffect: h.sideEffect.join(", "),
      health: h.health.join(", "),
      symptoms: h.symptoms.join(", "),
      process: h.process.join("\n"),
      imageUrl: h.imageUrl || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Herbs");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=herbs.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate Excel" });
  }
});


module.exports = router;
