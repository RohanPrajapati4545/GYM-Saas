const Inquiry = require("../models/Inquiry");

const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, company, message, source } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    const inquiry = new Inquiry({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || "",
      company: company || "",
      message: message.trim(),
      source: source || "LANDING_PAGE",
      status: "NEW",
    });

    await inquiry.save();

    return res.status(201).json({
      success: true,
      message: "Thank you for contacting us! Our team will reach out promptly.",
      data: {
        id: inquiry._id,
        createdAt: inquiry.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit inquiry" });
  }
};

const getInquiries = async (req, res) => {
  try {
    const { search = "", status, startDate, endDate, page = 1, limit = 10, sort = "-createdAt" } = req.query;
    const query = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ name: regex }, { email: regex }, { company: regex }, { phone: regex }];
    }

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * pageSize;

    const [inquiries, total] = await Promise.all([
      Inquiry.find(query).sort(sort).skip(skip).limit(pageSize),
      Inquiry.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: inquiries,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch inquiries" });
  }
};

const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }
    return res.status(200).json({ success: true, data: inquiry });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch inquiry" });
  }
};

const updateInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Inquiry updated successfully",
      data: inquiry,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update inquiry" });
  }
};

const updateInquiryStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updateData = { status };
    if (notes !== undefined) updateData.notes = notes;

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Inquiry marked as ${status}`,
      data: inquiry,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update inquiry status" });
  }
};

const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete inquiry" });
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiry,
  updateInquiryStatus,
  deleteInquiry,
};
