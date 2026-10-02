import React, { useEffect, useState, useCallback } from 'react';
import adminApi from '../../services/adminApi';
import {
  GitBranch,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  X,
  Building2,
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminBranches = () => {
  const [branches, setBranches] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gymFilter, setGymFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [formData, setFormData] = useState({
    gymId: '',
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    address: '',
    status: 'ACTIVE',
    openingTime: '06:00 AM',
    closingTime: '10:00 PM',
  });

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.get('/api/admin/branches', {
        params: {
          search,
          gymId: gymFilter !== 'ALL' ? gymFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      if (response.data?.success) {
        setBranches(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    } finally {
      setLoading(false);
    }
  }, [search, gymFilter, statusFilter, pagination.page, pagination.limit]);

  const fetchGyms = async () => {
    try {
      const response = await adminApi.get('/api/admin/gyms', { params: { limit: 100 } });
      if (response.data?.success) {
        setGyms(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch gyms for filter:', error);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchGyms();
  }, [fetchBranches]);

  const handleOpenAdd = () => {
    setSelectedBranch(null);
    setFormData({
      gymId: gyms[0]?._id || '',
      name: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      address: '',
      status: 'ACTIVE',
      openingTime: '06:00 AM',
      closingTime: '10:00 PM',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (branch) => {
    setSelectedBranch(branch);
    setFormData({
      gymId: branch.gymId?._id || branch.gymId || '',
      name: branch.name || '',
      email: branch.email || '',
      phone: branch.phone || '',
      city: branch.city || '',
      state: branch.state || '',
      address: branch.address || '',
      status: branch.status || 'ACTIVE',
      openingTime: branch.openingTime || '06:00 AM',
      closingTime: branch.closingTime || '10:00 PM',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedBranch) {
        await adminApi.put(`/api/admin/branches/${selectedBranch._id}`, formData);
        Swal.fire({ title: 'Updated!', text: 'Branch updated successfully', icon: 'success', timer: 1500, showConfirmButton: false, background: '#10141d', color: '#fff' });
      } else {
        await adminApi.post('/api/admin/branches', formData);
        Swal.fire({ title: 'Created!', text: 'New facility branch registered', icon: 'success', timer: 1500, showConfirmButton: false, background: '#10141d', color: '#fff' });
      }
      setModalOpen(false);
      fetchBranches();
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Failed to save branch', icon: 'error', background: '#10141d', color: '#fff' });
    }
  };

  const handleStatusChange = async (branchId, newStatus) => {
    try {
      await adminApi.patch(`/api/admin/branches/${branchId}/status`, { status: newStatus });
      fetchBranches();
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'Failed to update branch status', icon: 'error', background: '#10141d', color: '#fff' });
    }
  };

  const handleDelete = (branch) => {
    Swal.fire({
      title: `Delete ${branch.name}?`,
      text: 'Are you sure you want to remove this branch location?',
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
          await adminApi.delete(`/api/admin/branches/${branch._id}`);
          Swal.fire({ title: 'Deleted', text: 'Branch removed', icon: 'success', timer: 1500, showConfirmButton: false, background: '#10141d', color: '#fff' });
          fetchBranches();
        } catch (error) {
          Swal.fire({ title: 'Error', text: 'Failed to delete branch', icon: 'error', background: '#10141d', color: '#fff' });
        }
      }
    });
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold m-0 font-hero" style={{ fontSize: '2.4rem' }}>
            FACILITY <span className="text-red">BRANCHES</span>
          </h2>
          <p className="text-muted m-0" style={{ fontSize: '0.9rem' }}>
            Multi-location gym network, operational hours, and managers
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-red">
          <Plus size={18} /> Add Branch
        </button>
      </div>

      <div className="content-card mb-4 p-3">
        <div className="row g-3">
          <div className="col-12 col-md-5">
            <div className="input-athletic-wrapper">
              <Search className="input-icon-athletic" size={16} />
              <input
                type="text"
                className="input-athletic"
                placeholder="Search branches by name, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <select
              className="input-athletic"
              value={gymFilter}
              onChange={(e) => setGymFilter(e.target.value)}
            >
              <option value="ALL">All Parent Gyms</option>
              {gyms.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
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
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="d-flex justify-content-center p-5">
            <Loader2 className="animate-spin text-red" size={32} />
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <GitBranch size={48} className="mb-3 opacity-50" />
            <h5>No Branches Found</h5>
            <p>Select another filter or click "Add Branch" to create one.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Branch Name</th>
                    <th>Parent Gym</th>
                    <th>City / Address</th>
                    <th>Operating Hours</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b) => (
                    <tr key={b._id}>
                      <td className="fw-bold text-white fs-6">
                        {b.name}
                      </td>
                      <td>
                        <span className="badge badge-info">{b.gymId?.name || 'Franchise Main'}</span>
                      </td>
                      <td>
                        <div>{b.city || 'Central Location'}</div>
                        <small className="text-muted">{b.address}</small>
                      </td>
                      <td>
                        <div className="text-silver" style={{ fontSize: '0.85rem' }}>{b.openingTime} - {b.closingTime}</div>
                      </td>
                      <td>
                        <div className="dropdown d-inline-block">
                          <button
                            className={`badge badge-${b.status === 'ACTIVE' ? 'success' : 'danger'} dropdown-toggle border-0`}
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            {b.status}
                          </button>
                          <ul className="dropdown-menu dropdown-menu-dark" style={{ backgroundColor: '#151a26' }}>
                            <li><button className="dropdown-item" onClick={() => handleStatusChange(b._id, 'ACTIVE')}>Set ACTIVE</button></li>
                            <li><button className="dropdown-item" onClick={() => handleStatusChange(b._id, 'INACTIVE')}>Set INACTIVE</button></li>
                          </ul>
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <button onClick={() => handleOpenEdit(b)} className="btn btn-sm btn-outline-warning p-1" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(b)} className="btn btn-sm btn-outline-danger p-1" title="Delete">
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
                  Showing {branches.length} of {pagination.total} branches
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

      {modalOpen && (
        <div className="custom-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="m-0 font-display">{selectedBranch ? 'Edit Branch Location' : 'Add New Branch'}</h4>
              <button className="btn text-muted p-1" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label text-muted">Parent Gym Franchise *</label>
                  <select
                    className="input-athletic"
                    value={formData.gymId}
                    onChange={(e) => setFormData({ ...formData, gymId: e.target.value })}
                    required
                  >
                    <option value="">Select Parent Franchise</option>
                    {gyms.map((g) => (
                      <option key={g._id} value={g._id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">Branch Name *</label>
                  <input
                    type="text"
                    className="input-athletic"
                    placeholder="e.g. Downtown Metro Hub"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
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
                  <label className="form-label text-muted">Opening Time</label>
                  <input
                    type="text"
                    className="input-athletic"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">Closing Time</label>
                  <input
                    type="text"
                    className="input-athletic"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-muted">Address</label>
                  <input
                    type="text"
                    className="input-athletic"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-sm">
                  {selectedBranch ? 'Save Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBranches;
