const Branch = require("../models/Branch");
const Gym = require("../models/Gym");

const getBranches = async (req, res) => {
  try {
    const { search = "", gymId, status, page = 1, limit = 10, sort = "-createdAt" } = req.query;
    const query = { isDeleted: false };

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ name: regex }, { city: regex }, { phone: regex }, { email: regex }];
    }

    if (gymId && gymId !== "ALL") {
      query.gymId = gymId;
    }

    if (status && status !== "ALL") {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * pageSize;

    const [branches, total] = await Promise.all([
      Branch.find(query).populate("gymId", "name email status").sort(sort).skip(skip).limit(pageSize),
      Branch.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: branches,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch branches" });
  }
};

const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findOne({ _id: req.params.id, isDeleted: false }).populate("gymId", "name email");
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }
    return res.status(200).json({ success: true, data: branch });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch branch" });
  }
};

const createBranch = async (req, res) => {
  try {
    const { gymId, name, managerId, email, phone, address, city, state, status, openingTime, closingTime } = req.body;

    if (!gymId || !name) {
      return res.status(400).json({ message: "Gym ID and branch name are required" });
    }

    const gymExists = await Gym.findOne({ _id: gymId, isDeleted: false });
    if (!gymExists) {
      return res.status(404).json({ message: "Associated Gym not found" });
    }

    const branch = new Branch({
      gymId,
      name: name.trim(),
      managerId: managerId || null,
      email: email ? email.trim().toLowerCase() : "",
      phone: phone || "",
      address: address || "",
      city: city || "",
      state: state || "",
      status: status || "ACTIVE",
      openingTime: openingTime || "06:00 AM",
      closingTime: closingTime || "10:00 PM",
    });

    await branch.save();

    return res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branch,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create branch" });
  }
};

const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: branch,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update branch" });
  }
};

const updateBranchStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({ message: "Invalid branch status" });
    }

    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { status },
      { new: true }
    );

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Branch status updated to ${status}`,
      data: branch,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update branch status" });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, status: "INACTIVE" },
      { new: true }
    );

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete branch" });
  }
};

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  updateBranchStatus,
  deleteBranch,
};
