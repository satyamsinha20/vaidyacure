const mongoose = require("mongoose");

const herbSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    description: { type: String, required: true },

    benefit: { type: [String], required: true },

    sideEffect: { type: [String], default: [] },

    health: { type: [String], default: [] },

    symptoms: { type: [String], required: true, index: true },

    // ✅ NEW FIELD: Process (Step-by-step)
    process: {
      type: [String],   // har string ek step hoga
      required: true
    },

    imageUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Herb", herbSchema);
