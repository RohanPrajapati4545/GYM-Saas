const Branch = require("../models/Branch");
const BranchManager = require("../models/BranchManager");
const Member = require("../models/Member");

const getBranches = async (req, res) => {
  try {
    const gymId = req.gym._id;
    const branches = await Branch.find({ gymId, isDeleted: false }).sort({ createdAt: -1 });

    // Update real member counts dynamically
    const enrichedBranches = await Promise.all(
      branches.map(async (b) => {
        const count = await Member.countDocuments({ branchId: b._id, isDeleted: false });
        const branchObj = b.toObject();
        branchObj.memberCount = count;
        return branchObj;
      })
    );

    return res.status(200).json({
      success: true,
      data: enrichedBranches,
    });
  } catch (error) {
    console.error("Get branches error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch branches" });
  }
};

const createBranch = async (req, res) => {
  try {
    const gymId = req.gym._id;
    const { name, email, phone, address, city, state, openingTime, closingTime, capacity, managerId } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Branch name is required" });
    }

    // Check branch quota limit
    const existingCount = await Branch.countDocuments({ gymId, isDeleted: false });
    const maxBranches = req.gym.maxBranches || 5;

    if (existingCount >= maxBranches) {
      return res.status(400).json({
        success: false,
        message: `Branch limit of ${maxBranches} reached for your plan. Please upgrade to add more branches.`,
      });
    }

    let managerName = "Unassigned";
    if (managerId) {
      const mgr = await BranchManager.findById(managerId);
      if (mgr) {
        managerName = mgr.name;
      }
    }

    const branch = await Branch.create({
      gymId,
      name: name.trim(),
      email: email || "",
      phone: phone || "",
      address: address || "",
      city: city || "Mumbai",
      state: state || "Maharashtra",
      openingTime: openingTime || "06:00 AM",
      closingTime: closingTime || "10:00 PM",
      capacity: capacity ? Number(capacity) : 300,
      managerId: managerId || null,
      managerName,
      status: "ACTIVE",
    });

    if (managerId) {
      await BranchManager.findByIdAndUpdate(managerId, {
        branchId: branch._id,
        branchName: branch.name,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Branch created successfully",
      data: branch,
    });
  } catch (error) {
    console.error("Create branch error:", error);
    return res.status(500).json({ success: false, message: "Failed to create branch" });
  }
};

const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, city, state, openingTime, closingTime, capacity, status, managerId } = req.body;

    const branch = await Branch.findOne({ _id: id, gymId: req.gym._id, isDeleted: false });
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    if (name) branch.name = name.trim();
    if (email !== undefined) branch.email = email;
    if (phone !== undefined) branch.phone = phone;
    if (address !== undefined) branch.address = address;
    if (city !== undefined) branch.city = city;
    if (state !== undefined) branch.state = state;
    if (openingTime !== undefined) branch.openingTime = openingTime;
    if (closingTime !== undefined) branch.closingTime = closingTime;
    if (capacity !== undefined) branch.capacity = Number(capacity);
    if (status !== undefined) branch.status = status;

    if (managerId !== undefined) {
      if (managerId) {
        const mgr = await BranchManager.findById(managerId);
        if (mgr) {
          branch.managerId = mgr._id;
          branch.managerName = mgr.name;
          await BranchManager.findByIdAndUpdate(managerId, {
            branchId: branch._id,
            branchName: branch.name,
          });
        }
      } else {
        branch.managerId = null;
        branch.managerName = "Unassigned";
      }
    }

    await branch.save();

    return res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      data: branch,
    });
  } catch (error) {
    console.error("Update branch error:", error);
    return res.status(500).json({ success: false, message: "Failed to update branch" });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findOne({ _id: id, gymId: req.gym._id });

    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    branch.isDeleted = true;
    await branch.save();

    // Unlink any manager
    await BranchManager.updateMany({ branchId: branch._id }, { branchId: null, branchName: "Unassigned" });

    return res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete branch" });
  }
};

module.exports = {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
};
