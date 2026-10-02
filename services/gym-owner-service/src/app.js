require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const dashboardRoutes = require("./routes/dashboardRoutes");
const gymRoutes = require("./routes/gymRoutes");
const branchRoutes = require("./routes/branchRoutes");
const branchManagerRoutes = require("./routes/branchManagerRoutes");
const memberRoutes = require("./routes/memberRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "gym-owner-service" });
});

// Register routes
app.use("/api/owner/dashboard", dashboardRoutes);
app.use("/api/owner/gym", gymRoutes);
app.use("/api/owner/branches", branchRoutes);
app.use("/api/owner/branch-managers", branchManagerRoutes);
app.use("/api/owner/members", memberRoutes);
app.use("/api/owner/attendance", attendanceRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Gym Owner Service Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5003;
const MONGO_URI = process.env.MONGO_URI || "mongodb://admin:admin@localhost:27018/gym_owner_db?authSource=admin";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`Connected to Gym Owner MongoDB on ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`Gym Owner Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

module.exports = app;
