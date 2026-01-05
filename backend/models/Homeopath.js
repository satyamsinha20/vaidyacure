const mongoose = require("mongoose");

const homeopathySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    description: { type: String, required: true },

    benefit: { type: [String], required: true },

    sideEffect: { type: [String], default: [] },

    health: { type: [String], default: [] },

    symptoms: { type: [String], required: true, index: true },

    // ✅ NEW FIELD: Dosage instructions or steps
    process: {
      type: [String],   // har string ek step/dosage instruction hogi
      required: true
    },

    potency: { type: String }, // e.g., 30C, 200C, 1M
    imageUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Homeopathy", homeopathySchema);
