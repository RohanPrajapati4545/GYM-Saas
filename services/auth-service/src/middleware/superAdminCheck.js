const superAdminCheck = (req, res, next) => {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Access denied. Super Admin role required." });
  }
  next();
};

module.exports = superAdminCheck;
