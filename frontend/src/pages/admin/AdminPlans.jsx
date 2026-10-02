import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  Check,
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 49,
    billingCycle: 'MONTHLY',
    duration: 1,
    maxBranches: 1,
    maxMembers: 100,
    features: '',
    isActive: true,
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get('/api/admin/plans');
      if (response.data?.success) {
        setPlans(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenAdd = () => {
    setSelectedPlan(null);
    setFormData({
      name: '',
      description: '',
      price: 49,
      billingCycle: 'MONTHLY',
      duration: 1,
      maxBranches: 1,
      maxMembers: 200,
      features: 'Multi-Branch Management, RFID Access Control, Member Invoicing',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name || '',
      description: plan.description || '',
      price: plan.price || 0,
      billingCycle: plan.billingCycle || 'MONTHLY',
      duration: plan.duration || 1,
      maxBranches: plan.maxBranches || 1,
      maxMembers: plan.maxMembers || 100,
      features: Array.isArray(plan.features) ? plan.features.join(', ') : (plan.features || ''),
      isActive: plan.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration),
        maxBranches: Number(formData.maxBranches),
        maxMembers: Number(formData.maxMembers),
        features: formData.features.split(',').map((f) => f.trim()).filter(Boolean),
      };

      if (selectedPlan) {
        await adminApi.put(`/api/admin/plans/${selectedPlan._id}`, payload);
        Swal.fire({ title: 'Updated!', text: 'Plan tier updated', icon: 'success', timer: 1500, showConfirmButton: false, background: '#10141d', color: '#fff' });
      } else {
        await adminApi.post('/api/admin/plans', payload);
        Swal.fire({ title: 'Created!', text: 'New subscription plan launched', icon: 'success', timer: 1500, showConfirmButton: false, background: '#10141d', color: '#fff' });
      }
      setModalOpen(false);
      fetchPlans();
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Failed to save plan', icon: 'error', background: '#10141d', color: '#fff' });
    }
  };

  const handleToggleStatus = async (plan) => {
    const newStatus = !plan.isActive;
    try {
      await adminApi.patch(`/api/admin/plans/${plan._id}/status`, { isActive: newStatus });
      fetchPlans();
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'Failed to update plan status', icon: 'error', background: '#10141d', color: '#fff' });
    }
  };

  const handleDelete = (plan) => {
    Swal.fire({
      title: `Delete ${plan.name}?`,
      text: 'Are you sure you want to permanently remove this plan tier from MongoDB?',
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
          await adminApi.delete(`/api/admin/plans/${plan._id}`);
          Swal.fire({ title: 'Deleted', text: 'Plan removed', icon: 'success', timer: 1500, showConfirmButton: false, background: '#10141d', color: '#fff' });
          fetchPlans();
        } catch (error) {
          Swal.fire({ title: 'Error', text: 'Failed to delete plan', icon: 'error', background: '#10141d', color: '#fff' });
        }
      }
    });
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold m-0 font-hero" style={{ fontSize: '2.4rem' }}>
            SUBSCRIPTION <span className="text-red">TIERS & PRICING</span>
          </h2>
          <p className="text-muted m-0" style={{ fontSize: '0.9rem' }}>
            Configure SaaS pricing packages stored in MongoDB database
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn-red">
          <Plus size={18} /> Create Plan Tier
        </button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center p-5">
          <Loader2 className="animate-spin text-red" size={32} />
        </div>
      ) : plans.length === 0 ? (
        <div className="content-card text-center py-5 text-muted">
          <CreditCard size={48} className="mb-3 opacity-50" />
          <h5>No Subscription Plans Available</h5>
          <p>Click "Create Plan Tier" to configure pricing.</p>
        </div>
      ) : (
        <div className="row g-4">
          {plans.map((plan) => (
            <div key={plan._id} className="col-12 col-md-6 col-xl-4">
              <div className="plan-card h-100 position-relative" style={{ border: plan.isActive ? '1px solid #ff2a2a' : '1px solid rgba(255,255,255,0.08)' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className={`badge badge-${plan.isActive ? 'success' : 'danger'}`}>
                    {plan.isActive ? 'ACTIVE TIER' : 'DISABLED'}
                  </span>
                  <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>
                    {plan.billingCycle}
                  </span>
                </div>

                <h3 className="font-display fs-4 m-0">{plan.name}</h3>
                <p className="text-muted mt-1" style={{ fontSize: '0.85rem', minHeight: '40px' }}>
                  {plan.description || 'Comprehensive SaaS management tier for gym owners.'}
                </p>

                <div className="plan-price my-3">
                  ${plan.price}
                  <span>/{plan.billingCycle === 'MONTHLY' ? 'mo' : 'yr'}</span>
                </div>

                <div className="d-flex justify-content-between text-muted border-top border-bottom border-dark py-2 mb-3" style={{ fontSize: '0.85rem' }}>
                  <span>Max Branches: <strong className="text-white">{plan.maxBranches}</strong></span>
                  <span>Max Members: <strong className="text-white">{plan.maxMembers}</strong></span>
                </div>

                <ul className="plan-features flex-grow-1">
                  {plan.features?.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>

                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-dark">
                  <button
                    onClick={() => handleToggleStatus(plan)}
                    className={`btn btn-sm ${plan.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                  >
                    {plan.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <div className="d-flex gap-2">
                    <button onClick={() => handleOpenEdit(plan)} className="btn btn-sm btn-outline-light p-1">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(plan)} className="btn btn-sm btn-outline-danger p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="custom-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="m-0 font-display">{selectedPlan ? 'Edit Plan Tier' : 'Create Subscription Plan'}</h4>
              <button className="btn text-muted p-1" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-8">
                  <label className="form-label text-muted">Plan Name *</label>
                  <input
                    type="text"
                    className="input-athletic"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label text-muted">Price ($) *</label>
                  <input
                    type="number"
                    className="input-athletic"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">Billing Cycle</label>
                  <select
                    className="input-athletic"
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  >
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="YEARLY">YEARLY</option>
                  </select>
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label text-muted">Max Branches</label>
                  <input
                    type="number"
                    className="input-athletic"
                    value={formData.maxBranches}
                    onChange={(e) => setFormData({ ...formData, maxBranches: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label text-muted">Max Members</label>
                  <input
                    type="number"
                    className="input-athletic"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-muted">Description</label>
                  <input
                    type="text"
                    className="input-athletic"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-muted">Features (Comma-separated)</label>
                  <textarea
                    className="input-athletic"
                    rows={3}
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-sm">
                  {selectedPlan ? 'Save Plan' : 'Publish Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
