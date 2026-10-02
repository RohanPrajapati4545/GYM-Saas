const bcrypt = require("bcrypt");
const BranchManager = require("../models/BranchManager");
const Branch = require("../models/Branch");

const getBranchManagers = async (req, res) => {
  try {
    const gymId = req.gym._id;
    const managers = await BranchManager.find({ gymId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: managers,
    });
  } catch (error) {
    console.error("Get branch managers error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch branch managers" });
  }
};

const createBranchManager = async (req, res) => {
  try {
    const gymId = req.gym._id;
    const { name, email, password, phone, branchId } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Manager name is required" });
    }

    if (!email || email.trim() === "") {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await BranchManager.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: "A manager with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let branchName = "All Branches";
    let assignedBranch = null;

    if (branchId) {
      assignedBranch = await Branch.findOne({ _id: branchId, gymId, isDeleted: false });
      if (assignedBranch) {
        branchName = assignedBranch.name;
      }
    }

    const manager = await BranchManager.create({
      gymId,
      branchId: assignedBranch ? assignedBranch._id : null,
      branchName,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || "",
      status: "ACTIVE",
    });

    if (assignedBranch) {
      assignedBranch.managerId = manager._id;
      assignedBranch.managerName = manager.name;
      await assignedBranch.save();
    }

    return res.status(201).json({
      success: true,
      message: "Branch Manager created successfully",
      data: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        branchId: manager.branchId,
        branchName: manager.branchName,
        status: manager.status,
        createdAt: manager.createdAt,
      },
    });
  } catch (error) {
    console.error("Create branch manager error:", error);
    return res.status(500).json({ success: false, message: "Failed to create branch manager" });
  }
};

const updateBranchManager = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.gym._id;
    const { name, email, password, phone, branchId, status } = req.body;

    const manager = await BranchManager.findOne({ _id: id, gymId });
    if (!manager) {
      return res.status(404).json({ success: false, message: "Branch Manager not found" });
    }

    if (name) manager.name = name.trim();
    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== manager.email) {
        const emailExists = await BranchManager.findOne({ email: normalizedEmail, _id: { $ne: id } });
        if (emailExists) {
          return res.status(409).json({ success: false, message: "Email is already in use by another manager" });
        }
        manager.email = normalizedEmail;
      }
    }

    if (phone !== undefined) manager.phone = phone;
    if (status !== undefined) manager.status = status;

    if (password && password.length >= 6) {
      manager.password = await bcrypt.hash(password, 10);
    }

    if (branchId !== undefined) {
      // Unlink old branch
      if (manager.branchId) {
        await Branch.findByIdAndUpdate(manager.branchId, {
          managerId: null,
          managerName: "Unassigned",
        });
      }

      if (branchId) {
        const assignedBranch = await Branch.findOne({ _id: branchId, gymId, isDeleted: false });
        if (assignedBranch) {
          manager.branchId = assignedBranch._id;
          manager.branchName = assignedBranch.name;
          assignedBranch.managerId = manager._id;
          assignedBranch.managerName = manager.name;
          await assignedBranch.save();
        }
      } else {
        manager.branchId = null;
        manager.branchName = "All Branches";
      }
    }

    await manager.save();

    return res.status(200).json({
      success: true,
      message: "Branch Manager updated successfully",
      data: manager,
    });
  } catch (error) {
    console.error("Update branch manager error:", error);
    return res.status(500).json({ success: false, message: "Failed to update branch manager" });
  }
};

const deleteBranchManager = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.gym._id;

    const manager = await BranchManager.findOne({ _id: id, gymId });
    if (!manager) {
      return res.status(404).json({ success: false, message: "Branch Manager not found" });
    }

    // Unlink from branch if assigned
    if (manager.branchId) {
      await Branch.findByIdAndUpdate(manager.branchId, {
        managerId: null,
        managerName: "Unassigned",
      });
    }

    await BranchManager.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Branch Manager deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete branch manager" });
  }
};

const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.gym._id;

    const manager = await BranchManager.findOne({ _id: id, gymId });
    if (!manager) {
      return res.status(404).json({ success: false, message: "Branch Manager not found" });
    }

    manager.status = manager.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await manager.save();

    return res.status(200).json({
      success: true,
      message: `Branch Manager status set to ${manager.status}`,
      data: manager,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to toggle status" });
  }
};

module.exports = {
  getBranchManagers,
  createBranchManager,
  updateBranchManager,
  deleteBranchManager,
  toggleStatus,
};
