const express = require("express");
const router = express.Router();
const { authenticate, ensureGymContext } = require("../middleware/auth");
const { getGymProfile, updateGymProfile, selectSubscriptionPlan } = require("../controllers/gymController");

router.use(authenticate);
router.use(ensureGymContext);

router.get("/profile", getGymProfile);
router.put("/profile", updateGymProfile);
router.post("/select-plan", selectSubscriptionPlan);

module.exports = router;
