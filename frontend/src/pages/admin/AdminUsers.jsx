import React, { useEffect, useState, useCallback } from 'react';
import adminApi from '../../services/adminApi';
import {
  Users,
  Search,
  Filter,
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.get('/api/admin/users', {
        params: {
          search,
          role: roleFilter !== 'ALL' ? roleFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      if (response.data?.success) {
        setUsers(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to fetch users from Auth Service:', error);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    try {
      await adminApi.patch(`/api/admin/users/${user._id}/status`, { isActive: newStatus });
      Swal.fire({
        title: newStatus ? 'User Activated' : 'User Deactivated',
        text: `Account for ${user.email} is now ${newStatus ? 'active' : 'inactive'}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#10141d',
        color: '#fff',
      });
      fetchUsers();
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Failed to update user', icon: 'error', background: '#10141d', color: '#fff' });
    }
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      await adminApi.patch(`/api/admin/users/${user._id}/role`, { role: newRole });
      Swal.fire({
        title: 'Role Updated',
        text: `${user.name} is now ${newRole}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#10141d',
        color: '#fff',
      });
      fetchUsers();
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Failed to update role', icon: 'error', background: '#10141d', color: '#fff' });
    }
  };

  const allowedRoles = ['GYM_OWNER', 'SUPER_ADMIN'];

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold m-0 font-hero" style={{ fontSize: '2.4rem' }}>
            PLATFORM <span className="text-red">USERS</span>
          </h2>
          <p className="text-muted m-0" style={{ fontSize: '0.9rem' }}>
            Global user accounts managed in Auth Microservice
          </p>
        </div>
      </div>

      <div className="content-card mb-4 p-3">
        <div className="row g-3">
          <div className="col-12 col-md-5">
            <div className="input-athletic-wrapper">
              <Search className="input-icon-athletic" size={16} />
              <input
                type="text"
                className="input-athletic"
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <select
              className="input-athletic"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              {allowedRoles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <select
              className="input-athletic"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Accounts</option>
              <option value="INACTIVE">Deactivated Accounts</option>
            </select>
          </div>
        </div>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="d-flex justify-content-center p-5">
            <Loader2 className="animate-spin text-red" size={32} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Users size={48} className="mb-3 opacity-50" />
            <h5>No Platform Users Found</h5>
            <p>Users registered through public or gym registration will appear here.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role Scope</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '32px', height: '32px', backgroundColor: '#ff2a2a', fontSize: '0.8rem' }}>
                            {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                          <span className="fw-bold text-white">{u.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted">{u.email}</span>
                      </td>
                      <td>
                        <div className="dropdown d-inline-block">
                          <button
                            className="badge badge-owner dropdown-toggle border-0"
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            {u.role}
                          </button>
                          <ul className="dropdown-menu dropdown-menu-dark" style={{ backgroundColor: '#151a26' }}>
                            {allowedRoles.map((r) => (
                              <li key={r}>
                                <button className="dropdown-item" onClick={() => handleRoleChange(u, r)}>
                                  Set as {r}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${u.isActive !== false ? 'success' : 'danger'}`}>
                          {u.isActive !== false ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                      </td>
                      <td>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="text-end">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`btn btn-sm ${u.isActive !== false ? 'btn-outline-danger' : 'btn-outline-success'} p-1`}
                          title={u.isActive !== false ? 'Deactivate User' : 'Activate User'}
                        >
                          {u.isActive !== false ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-dark">
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Showing {users.length} of {pagination.total} platform users
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-secondary-sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-secondary-sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
