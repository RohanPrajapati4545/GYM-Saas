const Plan = require("../models/Plan");

const getPlans = async (req, res) => {
  try {
    const { isActive, billingCycle } = req.query;
    const query = {};

    if (isActive !== undefined && isActive !== "ALL") {
      query.isActive = isActive === "true" || isActive === true;
    }

    if (billingCycle && billingCycle !== "ALL") {
      query.billingCycle = billingCycle;
    }

    const plans = await Plan.find(query).sort("price");
    return res.status(200).json({ success: true, data: plans });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch plans" });
  }
};

const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch plan" });
  }
};

const createPlan = async (req, res) => {
  try {
    const { name, description, price, billingCycle, duration, features, maxBranches, maxMembers, isActive } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "Plan name and price are required" });
    }

    const plan = new Plan({
      name: name.trim(),
      description: description || "",
      price: Number(price),
      billingCycle: billingCycle || "MONTHLY",
      duration: Number(duration) || 1,
      features: Array.isArray(features) ? features : (typeof features === "string" ? features.split(",").map(s => s.trim()) : []),
      maxBranches: Number(maxBranches) || 1,
      maxMembers: Number(maxMembers) || 100,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await plan.save();

    return res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      data: plan,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create plan" });
  }
};

const updatePlan = async (req, res) => {
  try {
    if (req.body.features && typeof req.body.features === "string") {
      req.body.features = req.body.features.split(",").map(s => s.trim());
    }

    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: plan,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update plan" });
  }
};

const updatePlanStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { isActive: Boolean(isActive) },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Plan status updated`,
      data: plan,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update plan status" });
  }
};

const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete plan" });
  }
};

module.exports = {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  updatePlanStatus,
  deletePlan,
};
