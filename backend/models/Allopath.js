const mongoose = require("mongoose");

const allopathSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    description: { type: String, required: true },

    // same as herb: benefit
    benefit: { type: [String], required: true },

    sideEffect: { type: [String], default: [] },

    health: { type: [String], default: [] },

    // same as herb: symptoms
    symptoms: { type: [String], required: true, index: true },

    // same as herb: step-by-step process
    process: {
      type: [String],
      required: true,
    },

    imageUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Allopath", allopathSchema);
