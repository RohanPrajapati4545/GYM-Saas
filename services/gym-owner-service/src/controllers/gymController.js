const Gym = require("../models/Gym");

const getGymProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.gym,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch gym profile" });
  }
};

const updateGymProfile = async (req, res) => {
  try {
    const { name, email, phone, logo, address, city, state, country, pincode, ownerName, ownerPhone, ownerEmail, facilityType, operatingHours } = req.body;

    const gym = await Gym.findById(req.gym._id);
    if (!gym) {
      return res.status(404).json({ success: false, message: "Gym not found" });
    }

    if (name) gym.name = name;
    if (email) gym.email = email;
    if (phone !== undefined) gym.phone = phone;
    if (logo !== undefined) gym.logo = logo;
    if (address !== undefined) gym.address = address;
    if (city !== undefined) gym.city = city;
    if (state !== undefined) gym.state = state;
    if (country !== undefined) gym.country = country;
    if (pincode !== undefined) gym.pincode = pincode;
    if (ownerName !== undefined) gym.ownerName = ownerName;
    if (ownerPhone !== undefined) gym.ownerPhone = ownerPhone;
    if (ownerEmail !== undefined) gym.ownerEmail = ownerEmail;
    if (facilityType !== undefined) gym.facilityType = facilityType;
    if (operatingHours !== undefined) gym.operatingHours = operatingHours;
    gym.isConfigured = true;

    await gym.save();

    return res.status(200).json({
      success: true,
      message: "Gym profile updated successfully",
      data: gym,
    });
  } catch (error) {
    console.error("Update gym profile error:", error);
    return res.status(500).json({ success: false, message: "Failed to update gym profile" });
  }
};

const selectSubscriptionPlan = async (req, res) => {
  try {
    const { planName, maxBranches, maxMembers, billingCycle, price } = req.body;
    const gym = await Gym.findById(req.gym._id);
    if (!gym) {
      return res.status(404).json({ success: false, message: "Gym not found" });
    }

    if (planName) gym.planName = planName;
    if (maxBranches) gym.maxBranches = Number(maxBranches);
    if (maxMembers) gym.maxMembers = Number(maxMembers);
    gym.status = "ACTIVE";

    await gym.save();

    return res.status(200).json({
      success: true,
      message: `Subscription plan ${gym.planName} activated successfully!`,
      data: gym,
    });
  } catch (error) {
    console.error("Select plan error:", error);
    return res.status(500).json({ success: false, message: "Failed to activate subscription plan" });
  }
};

module.exports = {
  getGymProfile,
  updateGymProfile,
  selectSubscriptionPlan,
};
