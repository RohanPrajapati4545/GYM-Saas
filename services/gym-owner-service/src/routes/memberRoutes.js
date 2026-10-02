const express = require("express");
const router = express.Router();
const { authenticate, ensureGymContext } = require("../middleware/auth");
const {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  recordCheckIn,
} = require("../controllers/memberController");

router.use(authenticate);
router.use(ensureGymContext);

router.get("/", getMembers);
router.post("/", createMember);
router.put("/:id", updateMember);
router.delete("/:id", deleteMember);
router.post("/:id/checkin", recordCheckIn);

module.exports = router;
