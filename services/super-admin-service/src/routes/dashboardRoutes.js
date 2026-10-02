const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");

router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get("/", getDashboardStats);

module.exports = router;
