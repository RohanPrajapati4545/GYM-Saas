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

// Public read routes for SaaS subscription plans (accessible by Landing Page, Pricing & Register modals)
router.get("/", getPlans);
router.get("/public", getPlans);
router.get("/:id", getPlanById);

// Protected Super Admin routes for modifying plans
router.use(authMiddleware);
router.use(superAdminMiddleware);

router.post("/", createPlan);
router.put("/:id", updatePlan);
router.patch("/:id/status", updatePlanStatus);
router.delete("/:id", deletePlan);

module.exports = router;
