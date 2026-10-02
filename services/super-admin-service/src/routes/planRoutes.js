const express = require("express");
const router = express.Router();
const {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  updatePlanStatus,
  deletePlan,
} = require("../controllers/planController");
const authMiddleware = require("../middleware/authMiddleware");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");

router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get("/", getPlans);
router.get("/:id", getPlanById);
router.post("/", createPlan);
router.put("/:id", updatePlan);
router.patch("/:id/status", updatePlanStatus);
router.delete("/:id", deletePlan);

module.exports = router;
