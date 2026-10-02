const express = require("express");
const router = express.Router();
const { getLandingCMS } = require("../controllers/cmsController");
const { getSettings } = require("../controllers/settingsController");
const { createInquiry } = require("../controllers/inquiryController");

router.get("/landing", getLandingCMS);
router.get("/settings", getSettings);
router.post("/inquiries", createInquiry);

module.exports = router;
