const express = require("express");
const router = express.Router();
const {
  getInquiries,
  getInquiryById,
  updateInquiry,
  updateInquiryStatus,
  deleteInquiry,
} = require("../controllers/inquiryController");
const authMiddleware = require("../middleware/authMiddleware");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");

router.use(authMiddleware);
router.use(superAdminMiddleware);

router.get("/", getInquiries);
router.get("/:id", getInquiryById);
router.put("/:id", updateInquiry);
router.patch("/:id/status", updateInquiryStatus);
router.delete("/:id", deleteInquiry);

module.exports = router;
