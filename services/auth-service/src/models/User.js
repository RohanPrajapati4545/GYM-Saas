const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "GYM_OWNER", "BRANCH_MANAGER", "STAFF", "TRAINER", "MEMBER"],
      default: "GYM_OWNER",
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
