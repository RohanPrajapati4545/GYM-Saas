const Gym = require("../models/Gym");
const Branch = require("../models/Branch");

const getGyms = async (req, res) => {
  try {
    const { search = "", status, plan, startDate, endDate, page = 1, limit = 10, sort = "-createdAt" } = req.query;
    const query = { isDeleted: false };

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ name: regex }, { email: regex }, { city: regex }, { phone: regex }];
    }

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (plan && plan !== "ALL") {
      query.subscriptionPlan = plan;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * pageSize;

    const [gyms, total] = await Promise.all([
      Gym.find(query).populate("subscriptionPlan", "name price billingCycle").sort(sort).skip(skip).limit(pageSize),
      Gym.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: gyms,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch gyms" });
  }
};

const getGymById = async (req, res) => {
  try {
    const gym = await Gym.findOne({ _id: req.params.id, isDeleted: false }).populate("subscriptionPlan");
    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    const branches = await Branch.find({ gymId: gym._id, isDeleted: false });

    return res.status(200).json({
      success: true,
      data: {
        ...gym.toObject(),
        branches,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch gym details" });
  }
};

const createGym = async (req, res) => {
  try {
    const { name, ownerId, email, phone, logo, address, city, state, country, status, subscriptionPlan, subscriptionStartDate, subscriptionEndDate } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Gym name and email are required" });
    }

    const gym = new Gym({
      name: name.trim(),
      ownerId: ownerId || null,
      email: email.trim().toLowerCase(),
      phone: phone || "",
      logo: logo || "",
      address: address || "",
      city: city || "",
      state: state || "",
      country: country || "India",
      status: status || "ACTIVE",
      subscriptionPlan: subscriptionPlan || null,
      subscriptionStartDate: subscriptionStartDate || new Date(),
      subscriptionEndDate: subscriptionEndDate || null,
    });

    await gym.save();

    return res.status(201).json({
      success: true,
      message: "Gym created successfully",
      data: gym,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create gym" });
  }
};

const updateGym = async (req, res) => {
  try {
    const gym = await Gym.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );

    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Gym updated successfully",
      data: gym,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update gym" });
  }
};

const updateGymStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const gym = await Gym.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { status },
      { new: true }
    );

    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Gym status updated to ${status}`,
      data: gym,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update gym status" });
  }
};

const deleteGym = async (req, res) => {
  try {
    const gym = await Gym.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, status: "INACTIVE" },
      { new: true }
    );

    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    await Branch.updateMany({ gymId: gym._id }, { isDeleted: true, status: "INACTIVE" });

    return res.status(200).json({
      success: true,
      message: "Gym and its branches removed successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete gym" });
  }
};

module.exports = {
  getGyms,
  getGymById,
  createGym,
  updateGym,
  updateGymStatus,
  deleteGym,
};
