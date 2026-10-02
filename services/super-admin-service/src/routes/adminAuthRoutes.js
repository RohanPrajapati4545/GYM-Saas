const express = require("express");
const router = express.Router();
const { login, getMe } = require("../controllers/adminAuthController");
const authMiddleware = require("../middleware/authMiddleware");
const superAdminMiddleware = require("../middleware/superAdminMiddleware");

router.post("/login", login);
router.get("/me", authMiddleware, superAdminMiddleware, getMe);

module.exports = router;
