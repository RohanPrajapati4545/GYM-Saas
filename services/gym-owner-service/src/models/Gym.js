const mongoose = require("mongoose");

const gymSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "India",
    },
    ownerName: {
      type: String,
      default: "",
    },
    ownerPhone: {
      type: String,
      default: "",
    },
    ownerEmail: {
      type: String,
      default: "",
    },
    facilityType: {
      type: String,
      default: "Commercial Gym & Fitness Club",
    },
    operatingHours: {
      type: String,
      default: "06:00 AM - 10:00 PM",
    },
    isConfigured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
    planName: {
      type: String,
      default: "Starter Plan",
    },
    maxBranches: {
      type: Number,
      default: 1,
    },
    maxMembers: {
      type: Number,
      default: 500,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Gym", gymSchema);
