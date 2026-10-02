const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");
const authMiddleware = require("../middleware/authMiddleware");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");

router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get("/", getSettings);
router.put("/", updateSettings);

module.exports = router;
