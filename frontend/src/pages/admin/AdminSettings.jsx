import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSettings } from '../../store/slices/settingsSlice';
import adminApi from '../../services/adminApi';
import {
  Settings,
  Save,
  Loader2,
  Image,
  Palette,
  Phone,
  Share2,
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminSettings = () => {
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.settings);
  const [formData, setFormData] = useState(settings || {});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await adminApi.get('/api/admin/settings');
        if (response.data?.success) {
          setFormData(response.data.data);
          dispatch(setSettings(response.data.data));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await adminApi.put('/api/admin/settings', formData);
      if (response.data?.success) {
        dispatch(setSettings(response.data.data));
        Swal.fire({
          title: 'Settings Saved!',
          text: 'Global brand & site settings have been updated across the platform.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: '#10141d',
          color: '#fff',
        });
      }
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'Failed to update settings', icon: 'error', background: '#10141d', color: '#fff' });
    } finally {
      setSaving(false);
    }
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
      <form onSubmit={handleSubmit}>
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div>
            <h2 className="fw-bold m-0 font-hero" style={{ fontSize: '2.4rem' }}>
              SITE & <span className="text-red">BRAND SETTINGS</span>
            </h2>
            <p className="text-muted m-0" style={{ fontSize: '0.9rem' }}>
              Configure dynamic logos, platform name, contact channels, and color schemes
            </p>
          </div>
          <button type="submit" className="btn-red" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>Save Global Settings</span>
          </button>
        </div>

        <div className="content-card mb-4">
          <h4 className="font-display border-bottom border-dark pb-2 mb-3 d-flex align-items-center gap-2">
            <Image size={20} className="text-red" /> Dynamic Brand Identity & Logo
          </h4>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label text-muted">Platform / Site Name</label>
              <input
                type="text"
                name="siteName"
                className="input-athletic"
                value={formData.siteName || ''}
                onChange={handleChange}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label text-muted">Custom Logo Image URL (Optional)</label>
              <input
                type="text"
                name="logo"
                className="input-athletic"
                placeholder="Leave empty for dynamic text/icon logo"
                value={formData.logo || ''}
                onChange={handleChange}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label text-muted">Primary Brand Color</label>
              <input
                type="text"
                name="primaryColor"
                className="input-athletic"
                value={formData.primaryColor || '#ff2a2a'}
                onChange={handleChange}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label text-muted">Secondary Dark Surface</label>
              <input
                type="text"
                name="secondaryColor"
                className="input-athletic"
                value={formData.secondaryColor || '#10141d'}
                onChange={handleChange}
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label text-muted">Accent Neon Tone</label>
              <input
                type="text"
                name="accentColor"
                className="input-athletic"
                value={formData.accentColor || '#ff5e14'}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="content-card mb-4">
          <h4 className="font-display border-bottom border-dark pb-2 mb-3 d-flex align-items-center gap-2">
            <Phone size={20} className="text-cyan" /> Support & Contact Details
          </h4>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label text-muted">Support Email</label>
              <input
                type="email"
                name="supportEmail"
                className="input-athletic"
                value={formData.supportEmail || ''}
                onChange={handleChange}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label text-muted">Support Hotline</label>
              <input
                type="text"
                name="supportPhone"
                className="input-athletic"
                value={formData.supportPhone || ''}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label text-muted">Headquarters Address</label>
              <input
                type="text"
                name="address"
                className="input-athletic"
                value={formData.address || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="content-card mb-4">
          <h4 className="font-display border-bottom border-dark pb-2 mb-3 d-flex align-items-center gap-2">
            <Share2 size={20} className="text-warning" /> Social Channels & Footer
          </h4>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label text-muted">Facebook URL</label>
              <input
                type="text"
                name="facebook"
                className="input-athletic"
                value={formData.facebook || ''}
                onChange={handleChange}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label text-muted">Instagram URL</label>
              <input
                type="text"
                name="instagram"
                className="input-athletic"
                value={formData.instagram || ''}
                onChange={handleChange}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label text-muted">Twitter / X URL</label>
              <input
                type="text"
                name="twitter"
                className="input-athletic"
                value={formData.twitter || ''}
                onChange={handleChange}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label text-muted">LinkedIn URL</label>
              <input
                type="text"
                name="linkedin"
                className="input-athletic"
                value={formData.linkedin || ''}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label text-muted">Footer Copyright Text</label>
              <input
                type="text"
                name="footerText"
                className="input-athletic"
                value={formData.footerText || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
