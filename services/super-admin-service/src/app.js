const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const adminAuthRoutes = require("./routes/adminAuthRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const gymRoutes = require("./routes/gymRoutes");
const branchRoutes = require("./routes/branchRoutes");
const userRoutes = require("./routes/userRoutes");
const planRoutes = require("./routes/planRoutes");
const cmsRoutes = require("./routes/cmsRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const publicRoutes = require("./routes/publicRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/gyms", gymRoutes);
app.use("/api/admin/branches", branchRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/plans", planRoutes);
app.use("/api/admin/cms", cmsRoutes);
app.use("/api/admin/settings", settingsRoutes);
app.use("/api/admin/inquiries", inquiryRoutes);
app.use("/api/public", publicRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Super Admin Service is running" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5002;

if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Super Admin Service running on port ${PORT}`);
    });
  });
}

module.exports = app;
