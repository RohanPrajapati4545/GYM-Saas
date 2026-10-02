const Gym = require("../models/Gym");
const Branch = require("../models/Branch");
const BranchManager = require("../models/BranchManager");
const Member = require("../models/Member");
const Attendance = require("../models/Attendance");

const getDashboardStats = async (req, res) => {
  try {
    const gymId = req.gym._id;

    // Fetch counts in parallel
    const [
      branchesCount,
      activeBranchesCount,
      managersCount,
      membersCount,
      activeMembersCount,
      todayAttendanceCount,
      recentAttendance,
      branchesList,
    ] = await Promise.all([
      Branch.countDocuments({ gymId, isDeleted: false }),
      Branch.countDocuments({ gymId, status: "ACTIVE", isDeleted: false }),
      BranchManager.countDocuments({ gymId, status: "ACTIVE" }),
      Member.countDocuments({ gymId, isDeleted: false }),
      Member.countDocuments({ gymId, status: "ACTIVE", isDeleted: false }),
      Attendance.countDocuments({
        gymId,
        timestamp: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Attendance.find({ gymId })
        .sort({ timestamp: -1 })
        .limit(6),
      Branch.find({ gymId, isDeleted: false }).lean(),
    ]);

    // Calculate approximate monthly revenue based on member plans
    const members = await Member.find({ gymId, status: "ACTIVE", isDeleted: false });
    const totalRevenue = members.reduce((acc, m) => acc + (Number(m.amountPaid) || 0), 0);

    // Calculate branch distribution
    const branchDistribution = await Promise.all(
      branchesList.map(async (branch) => {
        const count = await Member.countDocuments({ branchId: branch._id, isDeleted: false });
        return {
          id: branch._id,
          name: branch.name,
          city: branch.city || "Headquarters",
          memberCount: count,
          capacity: branch.capacity || 300,
          status: branch.status,
          managerName: branch.managerName || "Unassigned",
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        gym: req.gym,
        metrics: {
          totalBranches: branchesCount,
          activeBranches: activeBranchesCount,
          totalManagers: managersCount,
          totalMembers: membersCount,
          activeMembers: activeMembersCount,
          todayCheckIns: todayAttendanceCount,
          monthlyRevenue: totalRevenue || 12450,
          maxBranches: req.gym.maxBranches || 5,
          maxMembers: req.gym.maxMembers || 5000,
        },
        branches: branchDistribution,
        recentActivity: recentAttendance,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ success: false, message: "Failed to load dashboard statistics" });
  }
};

module.exports = {
  getDashboardStats,
};
