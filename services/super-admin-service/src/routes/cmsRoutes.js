const express = require("express");
const router = express.Router();
const {
  getLandingCMS,
  updateLandingCMS,
} = require("../controllers/cmsController");
const authMiddleware = require("../middleware/authMiddleware");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");

router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get("/landing", getLandingCMS);
router.put("/landing", updateLandingCMS);

module.exports = router;
