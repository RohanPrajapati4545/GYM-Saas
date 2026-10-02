const authServiceClient = require("../services/authServiceClient");

const getUsers = async (req, res) => {
  try {
    const data = await authServiceClient.getUsers(req.query);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch users from Auth Service" });
  }
};

const getUserById = async (req, res) => {
  try {
    const data = await authServiceClient.getUserById(req.params.id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch user from Auth Service" });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const data = await authServiceClient.updateUserStatus(req.params.id, req.body);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update user status in Auth Service" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const data = await authServiceClient.updateUserRole(req.params.id, req.body);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update user role in Auth Service" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const data = await authServiceClient.deleteUser(req.params.id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to delete user in Auth Service" });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
};
