const Member = require("../models/Member");
const Branch = require("../models/Branch");
const Attendance = require("../models/Attendance");

const getMembers = async (req, res) => {
  try {
    const gymId = req.gym._id;
    const { branchId, status, search } = req.query;

    const query = { gymId, isDeleted: false };
    if (branchId) query.branchId = branchId;
    if (status) query.status = status;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }, { rfidTag: searchRegex }];
    }

    const members = await Member.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Get members error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch members" });
  }
};

const createMember = async (req, res) => {
  try {
    const gymId = req.gym._id;
    const { name, email, phone, gender, branchId, planType, amountPaid, rfidTag, emergencyContact, durationDays } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, message: "Member name is required" });
    }

    if (!phone || phone.trim() === "") {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    if (!branchId) {
      return res.status(400).json({ success: false, message: "Please select a gym branch" });
    }

    const branch = await Branch.findOne({ _id: branchId, gymId, isDeleted: false });
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    const startDate = new Date();
    const days = durationDays ? Number(durationDays) : planType === "ANNUAL" ? 365 : planType === "QUARTERLY" ? 90 : 30;
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

    const member = await Member.create({
      gymId,
      branchId: branch._id,
      branchName: branch.name,
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : "",
      phone: phone.trim(),
      gender: gender || "MALE",
      planType: planType || "MONTHLY",
      amountPaid: amountPaid ? Number(amountPaid) : 49,
      rfidTag: rfidTag || `RFID-${Math.floor(100000 + Math.random() * 900000)}`,
      emergencyContact: emergencyContact || "",
      startDate,
      endDate,
      status: "ACTIVE",
    });

    // Update branch member count
    branch.memberCount = (branch.memberCount || 0) + 1;
    await branch.save();

    return res.status(201).json({
      success: true,
      message: "Member registered successfully",
      data: member,
    });
  } catch (error) {
    console.error("Create member error:", error);
    return res.status(500).json({ success: false, message: "Failed to register member" });
  }
};

const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.gym._id;
    const { name, email, phone, gender, branchId, planType, status, amountPaid, rfidTag, emergencyContact } = req.body;

    const member = await Member.findOne({ _id: id, gymId, isDeleted: false });
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    if (name) member.name = name.trim();
    if (email !== undefined) member.email = email.trim().toLowerCase();
    if (phone) member.phone = phone.trim();
    if (gender) member.gender = gender;
    if (planType) member.planType = planType;
    if (status) member.status = status;
    if (amountPaid !== undefined) member.amountPaid = Number(amountPaid);
    if (rfidTag !== undefined) member.rfidTag = rfidTag;
    if (emergencyContact !== undefined) member.emergencyContact = emergencyContact;

    if (branchId && branchId !== member.branchId.toString()) {
      const newBranch = await Branch.findOne({ _id: branchId, gymId, isDeleted: false });
      if (newBranch) {
        member.branchId = newBranch._id;
        member.branchName = newBranch.name;
      }
    }

    await member.save();

    return res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: member,
    });
  } catch (error) {
    console.error("Update member error:", error);
    return res.status(500).json({ success: false, message: "Failed to update member" });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findOne({ _id: id, gymId: req.gym._id });

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    member.isDeleted = true;
    await member.save();

    return res.status(200).json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete member" });
  }
};

const recordCheckIn = async (req, res) => {
  try {
    const { id } = req.params;
    const gymId = req.gym._id;

    const member = await Member.findOne({ _id: id, gymId, isDeleted: false });
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    const attendance = await Attendance.create({
      gymId,
      branchId: member.branchId,
      branchName: member.branchName,
      memberId: member._id,
      memberName: member.name,
      timestamp: new Date(),
      type: "RFID_GATE",
      status: member.status === "ACTIVE" ? "GRANTED" : "DENIED",
    });

    return res.status(200).json({
      success: true,
      message: member.status === "ACTIVE" ? `Check-In GRANTED for ${member.name}` : `Check-In DENIED (${member.status})`,
      data: attendance,
    });
  } catch (error) {
    console.error("CheckIn error:", error);
    return res.status(500).json({ success: false, message: "Failed to record check-in" });
  }
};

module.exports = {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  recordCheckIn,
};
