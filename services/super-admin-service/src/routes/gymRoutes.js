const express = require("express");
const router = express.Router();
const {
  getGyms,
  getGymById,
  createGym,
  updateGym,
  updateGymStatus,
  deleteGym,
} = require("../controllers/gymController");
const authMiddleware = require("../middleware/authMiddleware");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");

router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get("/", getGyms);
router.get("/:id", getGymById);
router.post("/", createGym);
router.put("/:id", updateGym);
router.patch("/:id/status", updateGymStatus);
router.delete("/:id", deleteGym);

module.exports = router;
