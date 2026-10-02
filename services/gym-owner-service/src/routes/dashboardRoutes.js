const express = require("express");
const router = express.Router();
const { authenticate, ensureGymContext } = require("../middleware/auth");
const { getDashboardStats } = require("../controllers/dashboardController");

router.use(authenticate);
router.use(ensureGymContext);

router.get("/stats", getDashboardStats);

module.exports = router;
