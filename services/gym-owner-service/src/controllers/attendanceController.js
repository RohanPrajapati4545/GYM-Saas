const Attendance = require("../models/Attendance");
const Member = require("../models/Member");

const getAttendanceLogs = async (req, res) => {
  try {
    const gymId = req.gym._id;
    const { branchId, limit = 50 } = req.query;

    const query = { gymId };
    if (branchId) query.branchId = branchId;

    const logs = await Attendance.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch attendance logs" });
  }
};

const recordDirectCheckIn = async (req, res) => {
  try {
    const gymId = req.gym._id;
    const { memberId, rfidTag, branchId } = req.body;

    let member;
    if (memberId) {
      member = await Member.findOne({ _id: memberId, gymId, isDeleted: false });
    } else if (rfidTag) {
      member = await Member.findOne({ rfidTag, gymId, isDeleted: false });
    }

    if (!member) {
      return res.status(404).json({ success: false, message: "Member card / RFID tag not recognized" });
    }

    const attendance = await Attendance.create({
      gymId,
      branchId: branchId || member.branchId,
      branchName: member.branchName,
      memberId: member._id,
      memberName: member.name,
      timestamp: new Date(),
      type: rfidTag ? "RFID_GATE" : "MANUAL",
      status: member.status === "ACTIVE" ? "GRANTED" : "DENIED",
    });

    return res.status(201).json({
      success: true,
      message: member.status === "ACTIVE" ? `Access GRANTED for ${member.name}` : `Access DENIED (${member.status})`,
      data: attendance,
    });
  } catch (error) {
    console.error("Record direct check-in error:", error);
    return res.status(500).json({ success: false, message: "Failed to record check-in" });
  }
};

module.exports = {
  getAttendanceLogs,
  recordDirectCheckIn,
};
