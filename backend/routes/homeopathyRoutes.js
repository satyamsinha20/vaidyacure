const express = require("express");
const Homeopathy = require("../models/Homeopath");
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

// ---------------- GET ALL HOMEOPATHY ----------------
router.get("/", async (req, res) => {
  try {
    const { symptom } = req.query;

    let remedies;
    if (symptom && symptom.trim() && symptom !== "all") {
      remedies = await Homeopathy.find({
        symptoms: { $in: [symptom.toLowerCase()] },
      });
    } else {
      remedies = await Homeopathy.find();
    }

    res.json(remedies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ---------------- ADD HOMEOPATHY ----------------
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
        ? req.body.process.split("\n").map((p) => p.trim()).filter(Boolean)
        : ["general usage"],
      potency: req.body.potency || "",
      imageUrl,
    });

    res.status(201).json(await remedy.save());
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Homeopathy save failed" });
  }
});

// ---------------- UPDATE HOMEOPATHY ----------------
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const remedy = await Homeopathy.findById(req.params.id);
    if (!remedy) return res.status(404).json({ message: "Remedy not found" });

    remedy.name = req.body.name || remedy.name;
    remedy.description = req.body.description || remedy.description;
    remedy.benefit = req.body.benefit
      ? normalizeArray(req.body.benefit)
      : remedy.benefit;
    remedy.sideEffect = req.body.sideEffect
      ? normalizeArray(req.body.sideEffect)
      : remedy.sideEffect;
    remedy.health = req.body.health
      ? normalizeArray(req.body.health)
      : remedy.health;
    remedy.symptoms = req.body.symptoms
      ? normalizeArray(req.body.symptoms)
      : remedy.symptoms;
    remedy.process = req.body.process
      ? req.body.process.split("\n").map((p) => p.trim()).filter(Boolean)
      : remedy.process;
    remedy.potency = req.body.potency || remedy.potency;

    // Update image if new file uploaded
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`,
        { folder: "VaidyaCure/homeopathy" }
      );
      remedy.imageUrl = result.secure_url;
    } else if (req.body.imageUrl) {
      remedy.imageUrl = req.body.imageUrl;
    }

    const updated = await remedy.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Homeopathy update failed" });
  }
});

// ---------------- BULK UPLOAD ----------------
router.post("/bulk-upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });

    const saveRemedies = async (rows) => {
      for (const row of rows) {
        if (!row.name || !row.description) continue;

        await new Homeopathy({
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
          potency: row.potency || "",
          imageUrl: row.imageUrl || "",
        }).save();
      }
    };

    if (req.file.originalname.endsWith(".csv")) {
      const results = [];
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);

      bufferStream
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
          await saveRemedies(results);
          res.json({ message: "CSV uploaded successfully" });
        });
      return;
    }

    if (req.file.originalname.endsWith(".xlsx")) {
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      await saveRemedies(data);
      return res.json({ message: "Excel uploaded successfully" });
    }

    res.status(400).json({ message: "Unsupported file type" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Bulk upload failed" });
  }
});

// ---------------- DELETE HOMEOPATHY ----------------
router.delete("/:id", async (req, res) => {
  try {
    const remedy = await Homeopathy.findById(req.params.id);
    if (!remedy) return res.status(404).json({ message: "Remedy not found" });

    await remedy.deleteOne();
    res.json({ message: "Homeopathy deleted successfully ⚕️" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete remedy" });
  }
});

// ---------------- DOWNLOAD ALL HOMEOPATHY AS EXCEL ----------------
router.get("/download", async (req, res) => {
  try {
    const remedies = await Homeopathy.find();
    const data = remedies.map((r) => ({
      name: r.name,
      description: r.description,
      benefit: r.benefit.join(", "),
      sideEffect: r.sideEffect.join(", "),
      health: r.health.join(", "),
      symptoms: r.symptoms.join(", "),
      process: r.process.join("\n"),
      potency: r.potency || "",
      imageUrl: r.imageUrl || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Homeopathy");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=homeopathy.xlsx"
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
