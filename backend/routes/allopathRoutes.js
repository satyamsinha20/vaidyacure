const express = require("express");
const Allopath = require("../models/Allopath");
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

// ---------------- GET ALL MEDICINES ----------------
router.get("/", async (req, res) => {
  try {
    const { symptom } = req.query;

    let meds;
    if (symptom && symptom.trim() && symptom !== "all") {
      meds = await Allopath.find({
        symptoms: { $in: [symptom.toLowerCase()] },
      });
    } else {
      meds = await Allopath.find();
    }

    res.json(meds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ---------------- ADD NEW MEDICINE ----------------
router.post("/", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`,
        { folder: "VaidyaCure/allopath" }
      );
      imageUrl = result.secure_url;
    }

    const med = new Allopath({
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

    res.status(201).json(await med.save());
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Allopath save failed" });
  }
});

// ---------------- UPDATE MEDICINE ----------------
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const med = await Allopath.findById(req.params.id);
    if (!med) return res.status(404).json({ message: "Medicine not found" });

    med.name = req.body.name || med.name;
    med.description = req.body.description || med.description;
    med.benefit = req.body.benefit ? normalizeArray(req.body.benefit) : med.benefit;
    med.sideEffect = req.body.sideEffect ? normalizeArray(req.body.sideEffect) : med.sideEffect;
    med.health = req.body.health ? normalizeArray(req.body.health) : med.health;
    med.symptoms = req.body.symptoms ? normalizeArray(req.body.symptoms) : med.symptoms;
    med.process = req.body.process
      ? req.body.process.split("\n").map((p) => p.trim()).filter(Boolean)
      : med.process;

    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`,
        { folder: "VaidyaCure/allopath" }
      );
      med.imageUrl = result.secure_url;
    } else if (req.body.imageUrl) {
      med.imageUrl = req.body.imageUrl;
    }

    const updated = await med.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Update failed" });
  }
});

// ---------------- DELETE MEDICINE ----------------
router.delete("/:id", async (req, res) => {
  try {
    const med = await Allopath.findById(req.params.id);
    if (!med) return res.status(404).json({ message: "Medicine not found" });

    await med.deleteOne();
    res.json({ message: "Medicine deleted successfully 💊" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// ---------------- DOWNLOAD EXCEL ----------------
router.get("/download", async (req, res) => {
  try {
    const meds = await Allopath.find();
    const data = meds.map((m) => ({
      name: m.name,
      description: m.description,
      benefit: m.benefit.join(", "),
      sideEffect: m.sideEffect.join(", "),
      health: m.health.join(", "),
      symptoms: m.symptoms.join(", "),
      process: m.process.join("\n"),
      imageUrl: m.imageUrl || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Allopath");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Disposition", "attachment; filename=allopath.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Excel download failed" });
  }
});

// ---------------- BULK UPLOAD ----------------
router.post("/bulk-upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });

    const saveMeds = async (rows) => {
      for (const row of rows) {
        if (!row.name || !row.description) continue;

        await new Allopath({
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
        .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() })) // normalize CSV headers
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          await saveMeds(results);
          res.json({ message: "CSV uploaded successfully" });
        });
      return;
    }

    // EXCEL
    if (req.file.originalname.endsWith(".xlsx")) {
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      await saveMeds(data);
      return res.json({ message: "Excel uploaded successfully" });
    }

    res.status(400).json({ message: "Unsupported file type" });
  } catch (err) {
    console.error("Bulk upload error:", err);
    res.status(500).json({ message: "Bulk upload failed" });
  }
});

module.exports = router;
