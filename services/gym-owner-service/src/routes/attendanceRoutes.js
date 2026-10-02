const express = require("express");
const router = express.Router();
const { authenticate, ensureGymContext } = require("../middleware/auth");
const {
  getAttendanceLogs,
  recordDirectCheckIn,
} = require("../controllers/attendanceController");

router.use(authenticate);
router.use(ensureGymContext);

router.get("/", getAttendanceLogs);
router.post("/checkin", recordDirectCheckIn);

module.exports = router;
