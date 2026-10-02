const User = require("../models/User");
const ALLOWED_ADMIN_ROLES = ["GYM_OWNER", "SUPER_ADMIN"];

const getUsers = async (req, res) => {
  try {
    const { search = "", role, status, page = 1, limit = 10, sort = "-createdAt" } = req.query;
    const query = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ name: regex }, { email: regex }];
    }

    if (role && role !== "ALL") {
      query.role = role;
    }

    if (status !== undefined && status !== "" && status !== "ALL") {
      query.isActive = status === "ACTIVE" || status === "true" || status === true;
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNumber - 1) * pageSize;

    const [users, total] = await Promise.all([
      User.find(query).select("-password").sort(sort).skip(skip).limit(pageSize),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

const getUserStats = async (req, res) => {
  try {
    const [totalUsers, totalGymOwners, totalBranchManagers, totalCustomers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "GYM_OWNER" }),
      User.countDocuments({ role: "BRANCH_MANAGER" }),
      User.countDocuments({ role: { $in: ["CUSTOMER", "MEMBER"] } }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalGymOwners,
        totalBranchManagers,
        totalCustomers,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user statistics" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { isActive, status } = req.body;
    const finalActive = isActive !== undefined ? Boolean(isActive) : status === "ACTIVE";

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: finalActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user status" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !ALLOWED_ADMIN_ROLES.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Allowed roles are: " + ALLOWED_ADMIN_ROLES.join(", "),
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update user role" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User deactivated successfully", data: user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

module.exports = {
  getUsers,
  getUserStats,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
};
