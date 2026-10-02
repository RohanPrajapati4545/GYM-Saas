import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import {
  Globe,
  Save,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  HelpCircle,
  Award,
  Layers,
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminCMS = () => {
  const [cms, setCms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCMS = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get('/api/admin/cms/landing');
      if (response.data?.success) {
        setCms(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch CMS content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMS();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await adminApi.put('/api/admin/cms/landing', cms);
      if (response.data?.success) {
        setCms(response.data.data);
        Swal.fire({
          title: 'CMS Updated!',
          text: 'Landing page content saved. Public landing page is immediately refreshed.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: '#10141d',
          color: '#fff',
        });
      }
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'Failed to update CMS', icon: 'error', background: '#10141d', color: '#fff' });
    } finally {
      setSaving(false);
    }
  };

  const updateHeroField = (field, value) => {
    setCms((prev) => ({
      ...prev,
      hero: { ...prev.hero, [field]: value },
    }));
  };

  const updateCtaField = (field, value) => {
    setCms((prev) => ({
      ...prev,
      cta: { ...prev.cta, [field]: value },
    }));
  };

  const handleAddFeature = () => {
    setCms((prev) => ({
      ...prev,
      features: [...(prev.features || []), { title: 'New Feature', description: 'Feature description', icon: 'Flame', isActive: true }],
    }));
  };

  const handleRemoveFeature = (idx) => {
    setCms((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  const handleAddFaq = () => {
    setCms((prev) => ({
      ...prev,
      faq: [...(prev.faq || []), { question: 'Frequently Asked Question?', answer: 'Comprehensive answer here.', isActive: true }],
    }));
  };

  const handleRemoveFaq = (idx) => {
    setCms((prev) => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== idx),
    }));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Loader2 className="animate-spin text-red" size={36} />
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <form onSubmit={handleSave}>
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div>
            <h2 className="fw-bold m-0 font-hero" style={{ fontSize: '2.4rem' }}>
              LANDING PAGE <span className="text-red">CMS MANAGER</span>
            </h2>
            <p className="text-muted m-0" style={{ fontSize: '0.9rem' }}>
              Dynamically customize public landing page hero, copy, features, and FAQ
            </p>
          </div>
          <button type="submit" className="btn-red" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>Save & Publish CMS</span>
          </button>
        </div>

        <div className="content-card mb-4">
          <h4 className="font-display border-bottom border-dark pb-2 mb-3 d-flex align-items-center gap-2">
            <Sparkles size={20} className="text-red" /> Hero Header Section
          </h4>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label text-muted">Hero Badge</label>
              <input
                type="text"
                className="input-athletic"
                value={cms?.hero?.badge || ''}
                onChange={(e) => updateHeroField('badge', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-8">
              <label className="form-label text-muted">Headline Title (e.g. BE STRONG)</label>
              <input
                type="text"
                className="input-athletic"
                value={cms?.hero?.title || ''}
                onChange={(e) => updateHeroField('title', e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="form-label text-muted">Subtitle Tagline</label>
              <textarea
                className="input-athletic"
                rows={2}
                value={cms?.hero?.subtitle || ''}
                onChange={(e) => updateHeroField('subtitle', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label text-muted">Primary CTA Text</label>
              <input
                type="text"
                className="input-athletic"
                value={cms?.hero?.primaryButtonText || ''}
                onChange={(e) => updateHeroField('primaryButtonText', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label text-muted">Hero Athlete Image URL</label>
              <input
                type="text"
                className="input-athletic"
                value={cms?.hero?.heroImage || ''}
                onChange={(e) => updateHeroField('heroImage', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="content-card mb-4">
          <div className="d-flex justify-content-between align-items-center border-bottom border-dark pb-2 mb-3">
            <h4 className="font-display m-0 d-flex align-items-center gap-2">
              <Layers size={20} className="text-cyan" /> Features Modules ({cms?.features?.length || 0})
            </h4>
            <button type="button" onClick={handleAddFeature} className="btn btn-secondary-sm">
              <Plus size={16} /> Add Feature
            </button>
          </div>
          <div className="row g-3">
            {cms?.features?.map((f, idx) => (
              <div key={idx} className="col-12 col-md-6">
                <div className="p-3 rounded border border-dark" style={{ backgroundColor: '#08090d' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="badge badge-info">Feature #{idx + 1}</span>
                    <button type="button" onClick={() => handleRemoveFeature(idx)} className="btn btn-sm btn-outline-danger p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    className="input-athletic mb-2"
                    placeholder="Feature Title"
                    value={f.title}
                    onChange={(e) => {
                      const updated = [...cms.features];
                      updated[idx].title = e.target.value;
                      setCms({ ...cms, features: updated });
                    }}
                  />
                  <textarea
                    className="input-athletic"
                    rows={2}
                    placeholder="Description"
                    value={f.description}
                    onChange={(e) => {
                      const updated = [...cms.features];
                      updated[idx].description = e.target.value;
                      setCms({ ...cms, features: updated });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card mb-4">
          <div className="d-flex justify-content-between align-items-center border-bottom border-dark pb-2 mb-3">
            <h4 className="font-display m-0 d-flex align-items-center gap-2">
              <HelpCircle size={20} className="text-warning" /> FAQ Q&A List ({cms?.faq?.length || 0})
            </h4>
            <button type="button" onClick={handleAddFaq} className="btn btn-secondary-sm">
              <Plus size={16} /> Add FAQ
            </button>
          </div>
          <div className="row g-3">
            {cms?.faq?.map((q, idx) => (
              <div key={idx} className="col-12">
                <div className="p-3 rounded border border-dark" style={{ backgroundColor: '#08090d' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="badge badge-warning">Q#{idx + 1}</span>
                    <button type="button" onClick={() => handleRemoveFaq(idx)} className="btn btn-sm btn-outline-danger p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    className="input-athletic mb-2"
                    placeholder="Question"
                    value={q.question}
                    onChange={(e) => {
                      const updated = [...cms.faq];
                      updated[idx].question = e.target.value;
                      setCms({ ...cms, faq: updated });
                    }}
                  />
                  <textarea
                    className="input-athletic"
                    rows={2}
                    placeholder="Answer"
                    value={q.answer}
                    onChange={(e) => {
                      const updated = [...cms.faq];
                      updated[idx].answer = e.target.value;
                      setCms({ ...cms, faq: updated });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card mb-4">
          <h4 className="font-display border-bottom border-dark pb-2 mb-3 d-flex align-items-center gap-2">
            <Award size={20} className="text-red" /> Bottom Call-to-Action (CTA)
          </h4>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label text-muted">CTA Headline</label>
              <input
                type="text"
                className="input-athletic"
                value={cms?.cta?.title || ''}
                onChange={(e) => updateCtaField('title', e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label text-muted">Button Label</label>
              <input
                type="text"
                className="input-athletic"
                value={cms?.cta?.buttonText || ''}
                onChange={(e) => updateCtaField('buttonText', e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="form-label text-muted">Description</label>
              <textarea
                className="input-athletic"
                rows={2}
                value={cms?.cta?.description || ''}
                onChange={(e) => updateCtaField('description', e.target.value)}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminCMS;
