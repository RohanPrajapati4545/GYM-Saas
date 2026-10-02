const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      default: "LANDING_PAGE",
    },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"],
      default: "NEW",
    },
    assignedTo: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
