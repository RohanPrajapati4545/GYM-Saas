import React, { useEffect, useState, useCallback } from 'react';
import adminApi from '../../services/adminApi';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  X,
  Calendar,
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminGyms = () => {
  const [gyms, setGyms] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedGym, setSelectedGym] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: 'India',
    address: '',
    status: 'ACTIVE',
    subscriptionPlan: '',
  });

  const fetchGyms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.get('/api/admin/gyms', {
        params: {
          search,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      if (response.data?.success) {
        setGyms(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch gyms:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, pagination.page, pagination.limit]);

  const fetchPlans = async () => {
    try {
      const response = await adminApi.get('/api/admin/plans');
      if (response.data?.success) {
        setPlans(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  useEffect(() => {
    fetchGyms();
    fetchPlans();
  }, [fetchGyms]);

  const handleOpenAdd = () => {
    setSelectedGym(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      country: 'India',
      address: '',
      status: 'ACTIVE',
      subscriptionPlan: plans[0]?._id || '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (gym) => {
    setSelectedGym(gym);
    setFormData({
      name: gym.name || '',
      email: gym.email || '',
      phone: gym.phone || '',
      city: gym.city || '',
      state: gym.state || '',
      country: gym.country || 'India',
      address: gym.address || '',
      status: gym.status || 'ACTIVE',
      subscriptionPlan: gym.subscriptionPlan?._id || gym.subscriptionPlan || '',
    });
    setModalOpen(true);
  };

  const handleOpenView = async (gym) => {
    try {
      const res = await adminApi.get(`/api/admin/gyms/${gym._id}`);
      setSelectedGym(res.data?.data || gym);
      setViewModalOpen(true);
    } catch (err) {
      setSelectedGym(gym);
      setViewModalOpen(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedGym) {
        await adminApi.put(`/api/admin/gyms/${selectedGym._id}`, formData);
        Swal.fire({ title: 'Updated!', text: 'Gym updated successfully', icon: 'success', timer: 1500, showConfirmButton: false, background: '#10141d', color: '#fff' });
      } else {
        await adminApi.post('/api/admin/gyms', formData);
        Swal.fire({ title: 'Created!', text: 'New Gym franchise registered', icon: 'success', timer: 1500, showConfirmButton: false, background: '#10141d', color: '#fff' });
      }
      setModalOpen(false);
      fetchGyms();
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Action failed', icon: 'error', background: '#10141d', color: '#fff' });
    }
  };

  const handleStatusChange = async (gymId, newStatus) => {
    try {
      await adminApi.patch(`/api/admin/gyms/${gymId}/status`, { status: newStatus });
      fetchGyms();
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'Failed to update status', icon: 'error', background: '#10141d', color: '#fff' });
    }
  };

  const handleDelete = (gym) => {
    Swal.fire({
      title: `Delete ${gym.name}?`,
      text: 'This will soft delete the gym franchise and its branches from the active platform.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff2a2a',
      cancelButtonColor: '#1e2433',
      confirmButtonText: 'Yes, Delete',
      background: '#10141d',
      color: '#ffffff',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminApi.delete(`/api/admin/gyms/${gym._id}`);
          Swal.fire({ title: 'Removed', text: 'Gym deleted successfully', icon: 'success', timer: 1500, showConfirmButton: false, background: '#10141d', color: '#fff' });
          fetchGyms();
        } catch (error) {
          Swal.fire({ title: 'Error', text: 'Failed to delete gym', icon: 'error', background: '#10141d', color: '#fff' });
        }
      }
    });
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold m-0 font-hero" style={{ fontSize: '2.4rem' }}>
            GYM <span className="text-red">FRANCHISES</span>
          </h2>
          <p className="text-muted m-0" style={{ fontSize: '0.9rem' }}>
            Manage platform tenants, subscription tiers, and facility branches
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-red">
          <Plus size={18} /> Add New Gym
        </button>
      </div>

      <div className="content-card mb-4 p-3">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div className="input-athletic-wrapper">
              <Search className="input-icon-athletic" size={16} />
              <input
                type="text"
                className="input-athletic"
                placeholder="Search gym by name, email, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center gap-2">
              <Filter size={16} className="text-muted" />
              <select
                className="input-athletic"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="d-flex justify-content-center p-5">
            <Loader2 className="animate-spin text-red" size={32} />
          </div>
        ) : gyms.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <Building2 size={48} className="mb-3 opacity-50" />
            <h5>No Gym Franchises Found</h5>
            <p>Click "Add New Gym" to register your first platform tenant.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Gym Franchise</th>
                    <th>Location</th>
                    <th>Plan Tier</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gyms.map((gym) => (
                    <tr key={gym._id}>
                      <td>
                        <div className="fw-bold text-white fs-6">{gym.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{gym.email} {gym.phone && `• ${gym.phone}`}</div>
                      </td>
                      <td>
                        <div>{gym.city || 'National'}</div>
                        <small className="text-muted">{gym.country || 'India'}</small>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {gym.subscriptionPlan?.name || 'Standard Tier'}
                        </span>
                      </td>
                      <td>
                        <div className="dropdown d-inline-block">
                          <button
                            className={`badge badge-${gym.status === 'ACTIVE' ? 'success' : gym.status === 'PENDING' ? 'warning' : 'danger'} dropdown-toggle border-0`}
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            {gym.status}
                          </button>
                          <ul className="dropdown-menu dropdown-menu-dark" style={{ backgroundColor: '#151a26' }}>
                            <li><button className="dropdown-item" onClick={() => handleStatusChange(gym._id, 'ACTIVE')}>Activate</button></li>
                            <li><button className="dropdown-item" onClick={() => handleStatusChange(gym._id, 'INACTIVE')}>Deactivate</button></li>
                            <li><button className="dropdown-item" onClick={() => handleStatusChange(gym._id, 'SUSPENDED')}>Suspend</button></li>
                          </ul>
                        </div>
                      </td>
                      <td>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {new Date(gym.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <button onClick={() => handleOpenView(gym)} className="btn btn-sm btn-outline-secondary text-white p-1" title="View Details">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleOpenEdit(gym)} className="btn btn-sm btn-outline-warning p-1" title="Edit Gym">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(gym)} className="btn btn-sm btn-outline-danger p-1" title="Delete Gym">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-dark">
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Showing {gyms.length} of {pagination.total} gyms
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-secondary-sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </button>
                  <span className="btn btn-outline-dark text-white disabled">
                    {pagination.page} / {pagination.totalPages}
                  </span>
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

      {modalOpen && (
        <div className="custom-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="m-0 font-display">{selectedGym ? 'Edit Gym Franchise' : 'Add New Gym Franchise'}</h4>
              <button className="btn text-muted p-1" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">Gym Name *</label>
                  <input
                    type="text"
                    className="input-athletic"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">Official Email *</label>
                  <input
                    type="email"
                    className="input-athletic"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">Phone</label>
                  <input
                    type="text"
                    className="input-athletic"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">City</label>
                  <input
                    type="text"
                    className="input-athletic"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">Subscription Plan</label>
                  <select
                    className="input-athletic"
                    value={formData.subscriptionPlan}
                    onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                  >
                    <option value="">Select Plan Tier</option>
                    {plans.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (${p.price}/{p.billingCycle})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">Status</label>
                  <select
                    className="input-athletic"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-sm">
                  {selectedGym ? 'Save Changes' : 'Create Franchise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModalOpen && selectedGym && (
        <div className="custom-modal-backdrop" onClick={() => setViewModalOpen(false)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="m-0 font-display">{selectedGym.name} Details</h4>
              <button className="btn text-muted p-1" onClick={() => setViewModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Franchise ID</div>
                <div className="font-monospace text-cyan">{selectedGym._id}</div>
              </div>
              <div className="col-6">
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Status</div>
                <span className="badge badge-success">{selectedGym.status}</span>
              </div>
              <div className="col-6">
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Email</div>
                <div>{selectedGym.email}</div>
              </div>
              <div className="col-6">
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Phone</div>
                <div>{selectedGym.phone || 'N/A'}</div>
              </div>
              <div className="col-6">
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Location</div>
                <div>{selectedGym.city || 'N/A'}, {selectedGym.country || 'India'}</div>
              </div>
              <div className="col-6">
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Subscription Plan</div>
                <div className="fw-bold text-red">{selectedGym.subscriptionPlan?.name || 'Default Tier'}</div>
              </div>
            </div>

            <h5 className="font-display border-top border-dark pt-3 mb-2">Branches ({selectedGym.branches?.length || 0})</h5>
            {selectedGym.branches && selectedGym.branches.length > 0 ? (
              <ul className="list-group list-group-flush">
                {selectedGym.branches.map((b) => (
                  <li key={b._id} className="list-group-item bg-transparent text-white px-0 d-flex justify-content-between">
                    <div>
                      <strong>{b.name}</strong> - <span className="text-muted">{b.city || 'Main'}</span>
                    </div>
                    <span className="badge badge-success">{b.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>No branches added under this franchise yet.</p>
            )}

            <div className="d-flex justify-content-end mt-4">
              <button className="btn btn-secondary-sm" onClick={() => setViewModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGyms;
