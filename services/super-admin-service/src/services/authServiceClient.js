const axios = require("axios");
const jwt = require("jsonwebtoken");

const getAdminServiceToken = () => {
  return jwt.sign(
    {
      userId: "super-admin-system",
      role: "SUPER_ADMIN",
      tenantId: null,
      branchId: null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const createClient = () => {
  const baseURL = process.env.AUTH_SERVICE_URL || "http://localhost:5001";
  const token = getAdminServiceToken();

  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    timeout: 8000,
  });
};

const getUsers = async (params = {}) => {
  try {
    const client = createClient();
    const response = await client.get("/api/admin/users", { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch users from Auth Service");
  }
};

const getUserStats = async () => {
  try {
    const client = createClient();
    const response = await client.get("/api/admin/users/stats");
    return response.data?.data || { totalUsers: 0, totalGymOwners: 0, totalBranchManagers: 0, totalCustomers: 0 };
  } catch (error) {
    return { totalUsers: 0, totalGymOwners: 0, totalBranchManagers: 0, totalCustomers: 0, error: "Auth Service unavailable" };
  }
};

const getUserById = async (id) => {
  try {
    const client = createClient();
    const response = await client.get(`/api/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch user from Auth Service");
  }
};

const updateUserStatus = async (id, payload) => {
  try {
    const client = createClient();
    const response = await client.patch(`/api/admin/users/${id}/status`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update user status in Auth Service");
  }
};

const updateUserRole = async (id, payload) => {
  try {
    const client = createClient();
    const response = await client.patch(`/api/admin/users/${id}/role`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update user role in Auth Service");
  }
};

const deleteUser = async (id) => {
  try {
    const client = createClient();
    const response = await client.delete(`/api/admin/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete user in Auth Service");
  }
};

module.exports = {
  getUsers,
  getUserStats,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
};
