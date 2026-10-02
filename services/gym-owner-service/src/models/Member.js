const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    branchName: {
      type: String,
      default: "Main Branch",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      default: "MALE",
    },
    planType: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "ANNUAL", "VIP_PASS", "TRIAL"],
      default: "MONTHLY",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "FROZEN", "PENDING"],
      default: "ACTIVE",
    },
    amountPaid: {
      type: Number,
      default: 50,
    },
    rfidTag: {
      type: String,
      default: "",
    },
    emergencyContact: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Member", memberSchema);
