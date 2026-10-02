const express = require("express");
const router = express.Router();
const { authenticate, ensureGymContext } = require("../middleware/auth");
const {
  getBranchManagers,
  createBranchManager,
  updateBranchManager,
  deleteBranchManager,
  toggleStatus,
} = require("../controllers/branchManagerController");

router.use(authenticate);
router.use(ensureGymContext);

router.get("/", getBranchManagers);
router.post("/", createBranchManager);
router.put("/:id", updateBranchManager);
router.delete("/:id", deleteBranchManager);
router.patch("/:id/status", toggleStatus);

module.exports = router;
