const express = require("express");
const router = express.Router();
const { authenticate, ensureGymContext } = require("../middleware/auth");
const {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} = require("../controllers/branchController");

router.use(authenticate);
router.use(ensureGymContext);

router.get("/", getBranches);
router.post("/", createBranch);
router.put("/:id", updateBranch);
router.delete("/:id", deleteBranch);

module.exports = router;
