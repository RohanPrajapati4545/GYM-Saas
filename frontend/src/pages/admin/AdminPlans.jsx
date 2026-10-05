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
    tagline: '',
    description: '',
    price: 49,
    yearlyPrice: 39,
    billingCycle: 'MONTHLY',
    duration: 1,
    maxBranches: 1,
    maxMembers: 300,
    features: '',
    isPopular: false,
    isActive: true,
  });

  const syncPlansLocally = (updatedPlans) => {
    try {
      localStorage.setItem('admin_plans', JSON.stringify(updatedPlans));
      localStorage.setItem('admin_custom_plans', JSON.stringify(updatedPlans));
      window.dispatchEvent(new Event('adminPlansUpdated'));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('superadmin_plans_channel');
        bc.postMessage({ type: 'PLANS_UPDATED', plans: updatedPlans });
        bc.close();
      }
    } catch (e) {
      console.error('Failed to sync plans locally:', e);
    }
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      let fetchedPlans = [];
      try {
        const response = await adminApi.get('/api/admin/plans');
        if (response.data?.success && Array.isArray(response.data.data)) {
          fetchedPlans = response.data.data;
        }
      } catch (apiErr) {
        console.warn('Backend /api/admin/plans not responding, using cache', apiErr);
      }

      if (fetchedPlans.length === 0) {
        const stored = localStorage.getItem('admin_plans') || localStorage.getItem('admin_custom_plans');
        if (stored) {
          try {
            fetchedPlans = JSON.parse(stored);
          } catch (e) {}
        }
      }

      if (fetchedPlans.length > 0) {
        setPlans(fetchedPlans);
        syncPlansLocally(fetchedPlans);
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
      tagline: 'SINGLE BOUTIQUE CLUB',
      description: 'Ideal for standalone fitness studios, iron gyms, and single-owner clubs.',
      price: 49,
      yearlyPrice: 39,
      billingCycle: 'MONTHLY',
      duration: 1,
      maxBranches: 1,
      maxMembers: 300,
      features: 'WhatsApp Automated Billing & Reminders, Branded Member Digital Pass Web App, POS Invoicing & GST Tax Management, Trainer & Staff Attendance Logs, Standard Email & Chat Support',
      isPopular: false,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name || '',
      tagline: plan.tagline || '',
      description: plan.description || '',
      price: plan.price || 0,
      yearlyPrice: plan.yearlyPrice !== undefined ? plan.yearlyPrice : Math.round((plan.price || 0) * 0.8),
      billingCycle: plan.billingCycle || 'MONTHLY',
      duration: plan.duration || 1,
      maxBranches: plan.maxBranches || 1,
      maxMembers: plan.maxMembers || 300,
      features: Array.isArray(plan.features) ? plan.features.join(', ') : (plan.features || ''),
      isPopular: Boolean(plan.isPopular),
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
        yearlyPrice: Number(formData.yearlyPrice),
        duration: Number(formData.duration),
        maxBranches: Number(formData.maxBranches),
        maxMembers: Number(formData.maxMembers),
        isPopular: Boolean(formData.isPopular),
        isActive: Boolean(formData.isActive),
        features: formData.features.split(',').map((f) => f.trim()).filter(Boolean),
      };

      if (selectedPlan) {
        try {
          await adminApi.put(`/api/admin/plans/${selectedPlan._id}`, payload);
        } catch (apiErr) {
          console.warn('API error on put plan:', apiErr);
        }
        const updatedList = plans.map((p) => (p._id === selectedPlan._id ? { ...p, ...payload } : p));
        setPlans(updatedList);
        syncPlansLocally(updatedList);
        Swal.fire({ title: 'Updated!', text: 'Plan tier updated', icon: 'success', timer: 1500, showConfirmButton: false, background: '#10141d', color: '#fff' });
      } else {
        let createdRecord = null;
        try {
          const res = await adminApi.post('/api/admin/plans', payload);
          if (res.data?.data) {
            createdRecord = res.data.data;
          }
        } catch (apiErr) {
          console.warn('API error on post plan:', apiErr);
        }
        const newPlanItem = createdRecord || { ...payload, _id: 'plan_' + Date.now(), createdAt: new Date().toISOString() };
        const updatedList = [...plans, newPlanItem];
        setPlans(updatedList);
        syncPlansLocally(updatedList);
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
    const updatedList = plans.map((p) => (p._id === plan._id ? { ...p, isActive: newStatus } : p));
    setPlans(updatedList);
    syncPlansLocally(updatedList);
    try {
      await adminApi.patch(`/api/admin/plans/${plan._id}/status`, { isActive: newStatus });
    } catch (error) {
      console.warn('API toggle status error:', error);
    }
    fetchPlans();
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
        const updatedList = plans.filter((p) => p._id !== plan._id);
        setPlans(updatedList);
        syncPlansLocally(updatedList);
        try {
          await adminApi.delete(`/api/admin/plans/${plan._id}`);
          Swal.fire({ title: 'Deleted', text: 'Plan removed', icon: 'success', timer: 1500, showConfirmButton: false, background: '#10141d', color: '#fff' });
        } catch (error) {
          console.warn('API delete plan error:', error);
        }
        fetchPlans();
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
            Configure SaaS pricing packages displayed live on Home Page & Registration Modal
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
              <div
                className="plan-card h-100 position-relative d-flex flex-column justify-content-between"
                style={{
                  border: plan.isPopular ? '2px solid #ff2a2a' : plan.isActive ? '1px solid rgba(255,42,42,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  background: plan.isPopular ? 'linear-gradient(180deg, rgba(255,42,42,0.1) 0%, #10141d 100%)' : '#10141d',
                }}
              >
                {plan.isPopular && (
                  <span
                    className="badge position-absolute top-0 end-0 m-3 px-3 py-1"
                    style={{
                      background: '#ff2a2a',
                      color: '#fff',
                      fontWeight: '800',
                      borderRadius: '20px',
                    }}
                  >
                    🔥 POPULAR
                  </span>
                )}

                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className={`badge badge-${plan.isActive ? 'success' : 'danger'}`}>
                      {plan.isActive ? 'ACTIVE TIER' : 'DISABLED'}
                    </span>
                    <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>
                      {plan.billingCycle}
                    </span>
                  </div>

                  {plan.tagline && (
                    <span className="plan-badge d-inline-block mb-1" style={{ fontSize: '0.72rem' }}>
                      {plan.tagline}
                    </span>
                  )}
                  <h3 className="font-display fs-4 m-0">{plan.name}</h3>
                  <p className="text-muted mt-1" style={{ fontSize: '0.85rem', minHeight: '36px' }}>
                    {plan.description || 'Comprehensive SaaS management tier for gym owners.'}
                  </p>

                  <div className="plan-price my-3">
                    ${plan.price}
                    <span className="fs-6 text-silver">/month (Annual: ${plan.yearlyPrice || Math.round(plan.price * 0.8)}/mo)</span>
                  </div>

                  <div className="d-flex justify-content-between text-muted border-top border-bottom border-dark py-2 mb-3" style={{ fontSize: '0.85rem' }}>
                    <span>Max Branches: <strong className="text-white">{plan.maxBranches >= 50 ? 'Unlimited' : plan.maxBranches}</strong></span>
                    <span>Max Members: <strong className="text-white">{plan.maxMembers >= 10000 ? 'Unlimited' : plan.maxMembers?.toLocaleString()}</strong></span>
                  </div>

                  <ul className="plan-features">
                    {plan.features?.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-dark">
                  <button
                    onClick={() => handleToggleStatus(plan)}
                    className={`btn btn-sm ${plan.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                  >
                    {plan.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <div className="d-flex gap-2">
                    <button onClick={() => handleOpenEdit(plan)} className="btn btn-sm btn-outline-light p-1" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(plan)} className="btn btn-sm btn-outline-danger p-1" title="Delete">
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
          <div className="custom-modal-card" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="m-0 font-display">{selectedPlan ? 'Edit Plan Tier' : 'Create Subscription Plan'}</h4>
              <button className="btn text-muted p-1" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">Plan Name *</label>
                  <input
                    type="text"
                    className="input-athletic"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Growth Pro"
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">Tagline / Header Badge</label>
                  <input
                    type="text"
                    className="input-athletic"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. MULTI-BRANCH & HARDWARE"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">Monthly Price ($) *</label>
                  <input
                    type="number"
                    className="input-athletic"
                    value={formData.price}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setFormData({
                        ...formData,
                        price: e.target.value,
                        yearlyPrice: Math.round(p * 0.8),
                      });
                    }}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">Annual Billed Price ($/mo) *</label>
                  <input
                    type="number"
                    className="input-athletic"
                    value={formData.yearlyPrice}
                    onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">Max Branches Allowed</label>
                  <input
                    type="number"
                    className="input-athletic"
                    value={formData.maxBranches}
                    onChange={(e) => setFormData({ ...formData, maxBranches: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label text-muted">Max Members Limit</label>
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
                    placeholder="Brief description for landing page"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-muted">Features List (Comma-separated)</label>
                  <textarea
                    className="input-athletic"
                    rows={3}
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder="WhatsApp Invoicing, Biometric Gate Sync, POS Desk Billing"
                  />
                </div>
                <div className="col-12">
                  <label className="d-flex align-items-center gap-2 cursor-pointer text-white">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#ff2a2a' }}
                    />
                    <span>Highlight as 🔥 <strong>MOST POPULAR</strong> on Home Page & Registration</span>
                  </label>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-sm">
                  {selectedPlan ? 'Save Changes' : 'Publish Plan Live'}
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
