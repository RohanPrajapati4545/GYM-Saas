const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserStats,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminUserController");
const authMiddleware = require("../middleware/authMiddleware");
const superAdminCheck = require("../middleware/superAdminCheck");

router.use(authMiddleware);
router.use(superAdminCheck);

router.get("/", getUsers);
router.get("/stats", getUserStats);
router.get("/:id", getUserById);
router.patch("/:id/status", updateUserStatus);
router.patch("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

module.exports = router;
