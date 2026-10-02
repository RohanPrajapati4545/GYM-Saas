const Gym = require("../models/Gym");
const Branch = require("../models/Branch");
const Plan = require("../models/Plan");
const Inquiry = require("../models/Inquiry");
const authServiceClient = require("../services/authServiceClient");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalGyms,
      activeGyms,
      inactiveGyms,
      totalBranches,
      totalPlans,
      totalInquiries,
      recentGyms,
      recentInquiries,
      userStats,
      recentUsersResponse,
    ] = await Promise.all([
      Gym.countDocuments({ isDeleted: false }),
      Gym.countDocuments({ status: "ACTIVE", isDeleted: false }),
      Gym.countDocuments({ status: { $ne: "ACTIVE" }, isDeleted: false }),
      Branch.countDocuments({ isDeleted: false }),
      Plan.countDocuments({ isActive: true }),
      Inquiry.countDocuments(),
      Gym.find({ isDeleted: false }).sort("-createdAt").limit(5).select("name email status createdAt"),
      Inquiry.find().sort("-createdAt").limit(5).select("name email phone company status createdAt"),
      authServiceClient.getUserStats(),
      authServiceClient.getUsers({ page: 1, limit: 5, sort: "-createdAt" }).catch(() => ({ data: [] })),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        counts: {
          totalGyms,
          activeGyms,
          inactiveGyms,
          totalBranches,
          totalUsers: userStats.totalUsers || 0,
          totalGymOwners: userStats.totalGymOwners || 0,
          totalBranchManagers: userStats.totalBranchManagers || 0,
          totalCustomers: userStats.totalCustomers || 0,
          totalPlans,
          totalInquiries,
        },
        recent: {
          gyms: recentGyms,
          inquiries: recentInquiries,
          users: recentUsersResponse?.data || [],
        },
        servicesStatus: {
          authService: userStats.error ? "OFFLINE" : "HEALTHY",
          paymentService: "NOT_CONFIGURED",
          attendanceService: "NOT_CONFIGURED",
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
};

module.exports = {
  getDashboardStats,
};
