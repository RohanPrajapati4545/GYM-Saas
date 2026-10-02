import React, { useEffect, useState, useCallback } from 'react';
import adminApi from '../../services/adminApi';
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  Trash2,
  Loader2,
  X,
  Send,
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('NEW');

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.get('/api/admin/inquiries', {
        params: {
          search,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      if (response.data?.success) {
        setInquiries(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleOpenView = (inq) => {
    setSelectedInquiry(inq);
    setStatus(inq.status || 'NEW');
    setNotes(inq.notes || '');
    setModalOpen(true);
  };

  const handleSaveInquiry = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    try {
      await adminApi.patch(`/api/admin/inquiries/${selectedInquiry._id}/status`, {
        status,
        notes,
      });
      Swal.fire({ title: 'Saved!', text: 'Inquiry details updated', icon: 'success', timer: 1500, showConfirmButton: false, background: '#10141d', color: '#fff' });
      setModalOpen(false);
      fetchInquiries();
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'Failed to update inquiry', icon: 'error', background: '#10141d', color: '#fff' });
    }
  };

  const handleDelete = (inq) => {
    Swal.fire({
      title: 'Delete Inquiry?',
      text: `Are you sure you want to remove inquiry from ${inq.name}?`,
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
          await adminApi.delete(`/api/admin/inquiries/${inq._id}`);
          Swal.fire({ title: 'Deleted', text: 'Inquiry deleted', icon: 'success', timer: 1500, showConfirmButton: false, background: '#10141d', color: '#fff' });
          fetchInquiries();
        } catch (error) {
          Swal.fire({ title: 'Error', text: 'Failed to delete inquiry', icon: 'error', background: '#10141d', color: '#fff' });
        }
      }
    });
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold m-0 font-hero" style={{ fontSize: '2.4rem' }}>
            PROSPECT <span className="text-red">INQUIRIES & LEADS</span>
          </h2>
          <p className="text-muted m-0" style={{ fontSize: '0.9rem' }}>
            Review contact and demo submissions from the public landing page
          </p>
        </div>
      </div>

      <div className="content-card mb-4 p-3">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div className="input-athletic-wrapper">
              <Search className="input-icon-athletic" size={16} />
              <input
                type="text"
                className="input-athletic"
                placeholder="Search by prospect name, email, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-md-4">
            <select
              className="input-athletic"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Pipeline Stages</option>
              <option value="NEW">NEW LEAD</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="CONVERTED">CONVERTED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="d-flex justify-content-center p-5">
            <Loader2 className="animate-spin text-red" size={32} />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <MessageSquare size={48} className="mb-3 opacity-50" />
            <h5>No Inquiries Received</h5>
            <p>New demo requests submitted on the public landing page will appear here.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Prospect Lead</th>
                    <th>Phone / Company</th>
                    <th>Message Snippet</th>
                    <th>Pipeline Status</th>
                    <th>Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => (
                    <tr key={inq._id}>
                      <td>
                        <div className="fw-bold text-white">{inq.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{inq.email}</div>
                      </td>
                      <td>
                        <div>{inq.company || 'Private Gym'}</div>
                        <small className="text-muted">{inq.phone || 'No phone'}</small>
                      </td>
                      <td>
                        <div className="text-truncate text-silver" style={{ maxWidth: '280px', fontSize: '0.85rem' }}>
                          {inq.message}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${inq.status === 'NEW' ? 'red' : inq.status === 'CONVERTED' ? 'success' : 'warning'}`}>
                          {inq.status}
                        </span>
                      </td>
                      <td>
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {new Date(inq.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <button onClick={() => handleOpenView(inq)} className="btn btn-sm btn-outline-info p-1" title="View & Edit Notes">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleDelete(inq)} className="btn btn-sm btn-outline-danger p-1" title="Delete">
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
                  Showing {inquiries.length} of {pagination.total} inquiries
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

      {modalOpen && selectedInquiry && (
        <div className="custom-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="m-0 font-display">Inquiry from {selectedInquiry.name}</h4>
              <button className="btn text-muted p-1" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveInquiry}>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Email</span>
                  <div className="fw-bold">{selectedInquiry.email}</div>
                </div>
                <div className="col-6">
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Phone</span>
                  <div>{selectedInquiry.phone || 'N/A'}</div>
                </div>
                <div className="col-12">
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Company / Facility</span>
                  <div>{selectedInquiry.company || 'Not Specified'}</div>
                </div>
                <div className="col-12">
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Full Message</span>
                  <div className="p-3 rounded mt-1 text-white" style={{ backgroundColor: '#08090d', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {selectedInquiry.message}
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label text-muted">Pipeline Stage</label>
                  <select
                    className="input-athletic"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="QUALIFIED">QUALIFIED</option>
                    <option value="CONVERTED">CONVERTED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label text-muted">CRM Follow-Up Notes</label>
                  <textarea
                    className="input-athletic"
                    rows={3}
                    placeholder="Enter notes about phone conversation, demo scheduled, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary-sm" onClick={() => setModalOpen(false)}>
                  Close
                </button>
                <button type="submit" className="btn-primary-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
