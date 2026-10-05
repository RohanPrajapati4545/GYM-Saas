const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    billingCycle: {
      type: String,
      enum: ["MONTHLY", "YEARLY"],
      default: "MONTHLY",
    },
    duration: {
      type: Number,
      default: 1,
    },
    features: {
      type: [String],
      default: [],
    },
    maxBranches: {
      type: Number,
      default: 1,
    },
    maxMembers: {
      type: Number,
      default: 100,
    },
    tagline: {
      type: String,
      default: "",
    },
    yearlyPrice: {
      type: Number,
      default: 0,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Plan", planSchema);
