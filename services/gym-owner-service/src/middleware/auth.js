const jwt = require("jsonwebtoken");
const Gym = require("../models/Gym");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "gym_saas_secret_key");

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token is invalid or expired" });
  }
};

// Ensure gym exists for the user or get gym
const ensureGymContext = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid user token context" });
    }

    let gym = await Gym.findOne({ ownerId: userId });

    if (!gym) {
      // Auto-create initial Gym workspace for owner (unconfigured)
      gym = await Gym.create({
        ownerId: userId,
        name: req.body?.name || req.body?.gymName || "",
        email: req.user.email || req.body?.email || req.body?.gymEmail || "",
        phone: req.body?.phone || req.body?.gymPhone || "",
        address: req.body?.address || req.body?.gymAddress || "",
        city: req.body?.city || "",
        state: req.body?.state || "",
        pincode: req.body?.pincode || "",
        country: req.body?.country || "India",
        ownerName: req.user.name || req.body?.ownerName || "",
        ownerPhone: req.body?.ownerPhone || "",
        ownerEmail: req.user.email || req.body?.ownerEmail || "",
        isConfigured: false,
        status: "ACTIVE",
        planName: "Starter Plan",
        maxBranches: 1,
        maxMembers: 500,
      });
    }

    req.gym = gym;
    next();
  } catch (error) {
    console.error("Gym context error:", error);
    return res.status(500).json({ success: false, message: "Failed to resolve gym context" });
  }
};

module.exports = {
  authenticate,
  ensureGymContext,
};
