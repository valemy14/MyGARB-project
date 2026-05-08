import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api/mygarb';

const SPECIALTIES = [
  'suits', 'native_wear_men', 'native_wear_women', 'wedding_dresses',
  'casual_wear', 'corporate_wear', 'traditional_attire', 'unisex', 'children'
];

const formatLabel = (str) =>
  str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="dd-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`dd-toast ${t.type}`}>{t.message}</div>
      ))}
    </div>
  );
}

// ─── Edit Design Modal ────────────────────────────────────────────────────────
function EditDesignModal({ item, onSave, onClose }) {
  const editFileRef = useRef(null);
  const [form, setForm] = useState({
    title:       item.title       || '',
    description: item.description || '',
    category:    item.category    || '',
    isForSale:   item.isForSale   ?? false,  // 
    price:       item.price       || '',      // 
  });
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(item.image);
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    //  Validate: if listed for sale, price must be > 0
    if (form.isForSale && (!form.price || Number(form.price) <= 0)) {
      alert('Please set a price greater than 0 to list this design for sale.');
      return;
    }
    setSaving(true);
    await onSave(item._id, form, newImage);
    setSaving(false);
  };

  return (
    <div className="dd-modal-overlay" onClick={onClose}>
      <div className="dd-modal" onClick={e => e.stopPropagation()}>
        <div className="dd-modal-header">
          <h3>Edit Design</h3>
          <button className="dd-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="dd-edit-image-row">
          <img src={preview} alt={form.title} className="dd-edit-preview" />
          <div>
            <p className="dd-upload-hint">Tap to swap the image (optional)</p>
            <input
              ref={editFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <button className="dd-outline-btn" onClick={() => editFileRef.current?.click()}>
              Change Image
            </button>
          </div>
        </div>

        <div className="dd-form-grid" style={{ marginTop: 16 }}>
          <div className="dd-form-group full">
            <label className="dd-label">Title *</label>
            <input
              className="dd-input"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Blue Ankara Suit"
            />
          </div>

          <div className="dd-form-group">
            <label className="dd-label">Category</label>
            <select
              className="dd-select"
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            >
              <option value="">Select category</option>
              {SPECIALTIES.map(s => (
                <option key={s} value={s}>{formatLabel(s)}</option>
              ))}
            </select>
          </div>

          <div className="dd-form-group full">
            <label className="dd-label">Description</label>
            <input
              className="dd-input"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Brief description"
            />
          </div>

          {/*  List for sale toggle */}
          <div className="dd-form-group full">
            <div className="dd-forsale-row">
              <div>
                <label className="dd-label" style={{ marginBottom: 2 }}>List for Sale</label>
                <p className="dd-upload-hint" style={{ margin: 0 }}>
                  Customers can add this to cart at a fixed price
                </p>
              </div>
              <label className="dd-toggle">
                <input
                  type="checkbox"
                  checked={form.isForSale}
                  onChange={e => setForm(p => ({ ...p, isForSale: e.target.checked }))}
                />
                <span className="dd-toggle-track" />
              </label>
            </div>
          </div>

          {/*  Price — only shown when isForSale is on */}
          {form.isForSale && (
            <div className="dd-form-group full">
              <label className="dd-label">Price (₦) *</label>
              <input
                type="number"
                className="dd-input"
                value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                placeholder="e.g. 25000"
                min="1"
              />
            </div>
          )}
        </div>

        <div className="dd-modal-actions">
          <button className="dd-outline-btn" onClick={onClose}>Cancel</button>
          <button
            className="dd-save-btn"
            onClick={handleSubmit}
            disabled={saving || !form.title.trim()}
          >
            {saving ? 'Saving...' : '✦ Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DesignerDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('mygarb_token');
  const user = JSON.parse(localStorage.getItem('mygarb_user') || '{}');
  const fileRef = useRef(null);
  const profilePicRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [errors, setErrors] = useState({});
  const [editingItem, setEditingItem] = useState(null);

  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const [form, setForm] = useState({
    businessName: '', bio: '', specialties: [], experience: '',
    startingPrice: '', currency: 'NGN', city: '', state: '',
    country: 'Nigeria', availability: true, responseTime: 'Within 24 hours'
  });

  //  Added isForSale and price to portfolioForm
  const [portfolioForm, setPortfolioForm] = useState({
    title: '', description: '', category: '',
    isForSale: false, price: '',
    image: null, preview: null
  });

  const [profilePicPreview, setProfilePicPreview] = useState(null);

  useEffect(() => {
    if (!token || user.role !== 'designer') { navigate('/login'); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/designers/me/profile`, {
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        const p = data.data;
        setProfile(p);
        setForm({
          businessName: p.businessName || '', bio: p.bio || '',
          specialties: p.specialties || [], experience: p.experience || '',
          startingPrice: p.pricing?.startingPrice || '', currency: p.pricing?.currency || 'NGN',
          city: p.location?.city || '', state: p.location?.state || '',
          country: p.location?.country || 'Nigeria', availability: p.availability ?? true,
          responseTime: p.responseTime || 'Within 24 hours'
        });
      }
    } catch (e) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.businessName.trim()) e.businessName = 'Business name is required';
    if (form.bio.trim().length < 50) e.bio = `Bio must be at least 50 characters (${form.bio.trim().length}/50)`;
    if (form.specialties.length === 0) e.specialties = 'Select at least one specialty';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/designers/me/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({
          businessName: form.businessName, bio: form.bio, specialties: form.specialties,
          experience: Number(form.experience) || 0,
          pricing: { startingPrice: Number(form.startingPrice) || 0, currency: form.currency },
          location: { city: form.city, state: form.state, country: form.country },
          availability: form.availability, responseTime: form.responseTime
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProfile(data.data);
      showToast('Profile saved successfully!');
    } catch (e) {
      showToast(e.message || 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePicPreview(URL.createObjectURL(file));
  };

  const handleProfilePicUpload = async () => {
    const file = profilePicRef.current?.files[0];
    if (!file) { showToast('Please select an image first', 'error'); return; }
    setUploadingProfilePic(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API}/designers/me/profile-picture`, {
        method: 'POST', headers: { 'x-auth-token': token }, body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProfile(prev => ({ ...prev, profilePicture: data.data.profilePicture }));
      setProfilePicPreview(null);
      if (profilePicRef.current) profilePicRef.current.value = '';
      showToast('Profile picture updated!');
    } catch (e) {
      showToast(e.message || 'Failed to upload picture', 'error');
    } finally {
      setUploadingProfilePic(false);
    }
  };

  const handlePortfolioImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPortfolioForm(prev => ({ ...prev, image: file, preview: URL.createObjectURL(file) }));
  };

  const handlePortfolioUpload = async () => {
    if (!portfolioForm.image) { showToast('Please select an image', 'error'); return; }
    if (!portfolioForm.title.trim()) { showToast('Please add a title', 'error'); return; }
    //  Validate price if listing for sale
    if (portfolioForm.isForSale && (!portfolioForm.price || Number(portfolioForm.price) <= 0)) {
      showToast('Please set a price to list this design for sale', 'error'); return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', portfolioForm.image);
      fd.append('title', portfolioForm.title);
      fd.append('description', portfolioForm.description);
      fd.append('category', portfolioForm.category);
      fd.append('isForSale', portfolioForm.isForSale);  // 
      fd.append('price', portfolioForm.price || 0);      // 
      const res = await fetch(`${API}/designers/me/portfolio`, {
        method: 'POST', headers: { 'x-auth-token': token }, body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProfile(prev => ({ ...prev, portfolio: data.data }));
      setPortfolioForm({ title: '', description: '', category: '', isForSale: false, price: '', image: null, preview: null });
      if (fileRef.current) fileRef.current.value = '';
      showToast('Design added!');
    } catch (e) {
      showToast(e.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleEditDesign = async (imageId, fields, newImageFile) => {
    try {
      const fd = new FormData();
      if (fields.title)                     fd.append('title', fields.title);
      if (fields.description !== undefined) fd.append('description', fields.description);
      if (fields.category !== undefined)    fd.append('category', fields.category);
      fd.append('isForSale', fields.isForSale);  // always send
      fd.append('price', fields.price || 0);      //  always send
      if (newImageFile) fd.append('image', newImageFile);

      const res = await fetch(`${API}/designers/me/portfolio/${imageId}`, {
        method: 'PUT', headers: { 'x-auth-token': token }, body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setProfile(prev => ({
        ...prev,
        portfolio: prev.portfolio.map(item =>
          item._id === imageId ? { ...item, ...data.data } : item
        )
      }));
      setEditingItem(null);
      showToast('Design updated!');
    } catch (e) {
      showToast(e.message || 'Failed to update design', 'error');
    }
  };

  const handleDeletePortfolio = async (imageId) => {
    try {
      const res = await fetch(`${API}/designers/me/portfolio/${imageId}`, {
        method: 'DELETE', headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setProfile(prev => ({ ...prev, portfolio: data.data }));
      showToast('Design removed');
    } catch (e) {
      showToast(e.message || 'Failed to remove design', 'error');
    }
  };

  const toggleSpecialty = (s) => {
    setForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter(x => x !== s)
        : [...prev.specialties, s]
    }));
    setErrors(prev => ({ ...prev, specialties: '' }));
  };

  if (loading) return (
    <div className="dd-loading">
      <span className="dd-dot" /><span className="dd-dot" /><span className="dd-dot" />
    </div>
  );

  return (
    <>
      <div className="dd-page">

        <div className="dd-topbar">
          <span className="dd-topbar-title">Designer Dashboard</span>
          <div className="dd-topbar-right">
            <span className="dd-topbar-name">{user.name}</span>
            {profile && (
              <a href={`/designer/${profile._id}`} className="dd-view-profile">
                View Public Profile →
              </a>
            )}
          </div>
        </div>

        <div className="dd-layout">
          <nav className="dd-sidebar">
            {[
              { key: 'profile',   icon: '✦', label: 'My Profile' },
              { key: 'portfolio', icon: '◈', label: 'Portfolio' },
            ].map(item => (
              <button
                key={item.key}
                className={`dd-nav-item ${activeTab === item.key ? 'active' : ''}`}
                onClick={() => setActiveTab(item.key)}
              >
                <span className="dd-nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div className="dd-nav-divider" />
            <button className="dd-nav-item" onClick={() => navigate('/ourdesigners')}>
              <span className="dd-nav-icon">←</span>Browse Designers
            </button>
          </nav>

          <main className="dd-main">

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <>
                <div className="dd-section-header">
                  <h1 className="dd-section-title">My Profile</h1>
                  <p className="dd-section-sub">This is what clients see when they view your profile</p>
                </div>

                {profile && (
                  <div className="dd-stats">
                    <div className="dd-stat">
                      <div className="dd-stat-val">{profile.completedOrders || 0}</div>
                      <div className="dd-stat-lbl">Orders</div>
                    </div>
                    <div className="dd-stat">
                      <div className="dd-stat-val">{profile.rating?.toFixed(1) || '0.0'}</div>
                      <div className="dd-stat-lbl">Rating</div>
                    </div>
                    <div className="dd-stat">
                      <div className="dd-stat-val">{profile.totalReviews || 0}</div>
                      <div className="dd-stat-lbl">Reviews</div>
                    </div>
                  </div>
                )}

                {/* Profile Picture */}
                <div className="dd-card">
                  <p className="dd-card-title">Profile Picture</p>
                  <p className="dd-card-sub">Main photo clients see on your profile page</p>
                  <div className="dd-profile-pic-row">
                    <div className="dd-profile-pic-wrap">
                      {profilePicPreview || profile?.profilePicture ? (
                        <img src={profilePicPreview || profile.profilePicture} alt="Profile" className="dd-profile-pic-img" />
                      ) : (
                        <div className="dd-profile-pic-placeholder">
                          {form.businessName?.charAt(0)?.toUpperCase() || 'D'}
                        </div>
                      )}
                    </div>
                    <div className="dd-profile-pic-actions">
                      <p className="dd-upload-hint">JPEG, PNG or WebP — max 5MB</p>
                      <input ref={profilePicRef} type="file" accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }} onChange={handleProfilePicChange} />
                      <button className="dd-outline-btn" onClick={() => profilePicRef.current?.click()}>Choose Photo</button>
                      {profilePicPreview && (
                        <button className="dd-save-btn" style={{ marginTop: 8 }} onClick={handleProfilePicUpload} disabled={uploadingProfilePic}>
                          {uploadingProfilePic ? 'Uploading...' : '↑ Save Photo'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="dd-card">
                  <p className="dd-card-title">Basic Information</p>
                  <div className="dd-form-grid">
                    <div className="dd-form-group full">
                      <label className="dd-label">Business / Studio Name *</label>
                      <input className={`dd-input ${errors.businessName ? 'error' : ''}`} value={form.businessName}
                        onChange={e => { setForm(p => ({ ...p, businessName: e.target.value })); setErrors(p => ({ ...p, businessName: '' })); }}
                        placeholder="e.g. Adire by Tola" />
                      {errors.businessName && <span className="dd-error-msg">{errors.businessName}</span>}
                    </div>
                    <div className="dd-form-group full">
                      <label className="dd-label">Bio * <span>({form.bio.trim().length}/50 min)</span></label>
                      <textarea className={`dd-textarea ${errors.bio ? 'error' : ''}`} value={form.bio}
                        onChange={e => { setForm(p => ({ ...p, bio: e.target.value })); setErrors(p => ({ ...p, bio: '' })); }}
                        placeholder="Tell clients about your style..." rows={5} />
                      <div className={`dd-bio-counter ${form.bio.trim().length >= 50 ? 'ok' : ''}`}>
                        {form.bio.trim().length} / 50 minimum{form.bio.trim().length >= 50 ? ' ✓' : ''}
                      </div>
                      {errors.bio && <span className="dd-error-msg">{errors.bio}</span>}
                    </div>
                    <div className="dd-form-group">
                      <label className="dd-label">Years of Experience</label>
                      <input type="number" className="dd-input" value={form.experience}
                        onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} placeholder="e.g. 5" min="0" />
                    </div>
                    <div className="dd-form-group">
                      <label className="dd-label">Response Time</label>
                      <select className="dd-select" value={form.responseTime} onChange={e => setForm(p => ({ ...p, responseTime: e.target.value }))}>
                        <option>Within 24 hours</option>
                        <option>Within 48 hours</option>
                        <option>Within a week</option>
                        <option>Flexible</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div className="dd-card">
                  <p className="dd-card-title">Specialties *</p>
                  <div className="dd-specialties">
                    {SPECIALTIES.map(s => (
                      <button key={s} type="button" className={`dd-specialty-btn ${form.specialties.includes(s) ? 'active' : ''}`} onClick={() => toggleSpecialty(s)}>
                        {formatLabel(s)}
                      </button>
                    ))}
                  </div>
                  {errors.specialties && <span className="dd-error-msg" style={{ display: 'block', marginTop: 8 }}>{errors.specialties}</span>}
                </div>

                {/* Pricing & Location */}
                <div className="dd-card">
                  <p className="dd-card-title">Pricing & Location</p>
                  <div className="dd-form-grid">
                    <div className="dd-form-group">
                      <label className="dd-label">Starting Price (₦)</label>
                      <input type="number" className="dd-input" value={form.startingPrice}
                        onChange={e => setForm(p => ({ ...p, startingPrice: e.target.value }))} placeholder="e.g. 25000" min="0" />
                    </div>
                    <div className="dd-form-group">
                      <label className="dd-label">City</label>
                      <input className="dd-input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Lagos" />
                    </div>
                    <div className="dd-form-group">
                      <label className="dd-label">State</label>
                      <input className="dd-input" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="e.g. Lagos" />
                    </div>
                    <div className="dd-form-group">
                      <label className="dd-label">Availability</label>
                      <div className="dd-toggle-row">
                        <span className="dd-toggle-label">{form.availability ? 'Open for orders' : 'Not available'}</span>
                        <label className="dd-toggle">
                          <input type="checkbox" checked={form.availability} onChange={e => setForm(p => ({ ...p, availability: e.target.checked }))} />
                          <span className="dd-toggle-track" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="dd-save-btn" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : '✦ Save Profile'}
                </button>
              </>
            )}

            {/* ── Portfolio Tab ── */}
            {activeTab === 'portfolio' && (
              <>
                <div className="dd-section-header">
                  <h1 className="dd-section-title">Portfolio</h1>
                  <p className="dd-section-sub">Showcase your best work to attract clients</p>
                </div>

                {/* Add new design */}
                <div className="dd-card">
                  <p className="dd-card-title">Add New Design</p>

                  <div className="dd-upload-zone" onClick={() => fileRef.current?.click()}>
                    {portfolioForm.preview ? (
                      <img src={portfolioForm.preview} alt="Preview" className="dd-upload-preview" />
                    ) : (
                      <>
                        <div style={{ fontSize: '2rem', marginBottom: 8 }}>◈</div>
                        <p style={{ fontSize: '0.85rem', color: '#666' }}>Click to select an image</p>
                        <p className="dd-upload-hint">JPEG, PNG or WebP — max 5MB</p>
                      </>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }} onChange={handlePortfolioImageChange} />

                  <div className="dd-form-grid">
                    <div className="dd-form-group">
                      <label className="dd-label">Title *</label>
                      <input className="dd-input" value={portfolioForm.title}
                        onChange={e => setPortfolioForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. Blue Ankara Suit" />
                    </div>
                    <div className="dd-form-group">
                      <label className="dd-label">Category</label>
                      <select className="dd-select" value={portfolioForm.category}
                        onChange={e => setPortfolioForm(p => ({ ...p, category: e.target.value }))}>
                        <option value="">Select category</option>
                        {SPECIALTIES.map(s => <option key={s} value={s}>{formatLabel(s)}</option>)}
                      </select>
                    </div>
                    <div className="dd-form-group full">
                      <label className="dd-label">Description <span>(optional)</span></label>
                      <input className="dd-input" value={portfolioForm.description}
                        onChange={e => setPortfolioForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Brief description of this piece" />
                    </div>

                    {/*  List for Sale toggle */}
                    <div className="dd-form-group full">
                      <div className="dd-forsale-row">
                        <div>
                          <label className="dd-label" style={{ marginBottom: 2 }}>List for Sale</label>
                          <p className="dd-upload-hint" style={{ margin: 0 }}>
                            Customers can add this directly to cart at a fixed price
                          </p>
                        </div>
                        <label className="dd-toggle">
                          <input
                            type="checkbox"
                            checked={portfolioForm.isForSale}
                            onChange={e => setPortfolioForm(p => ({ ...p, isForSale: e.target.checked }))}
                          />
                          <span className="dd-toggle-track" />
                        </label>
                      </div>
                    </div>

                    {/*  Price — only shows when isForSale is on */}
                    {portfolioForm.isForSale && (
                      <div className="dd-form-group full">
                        <label className="dd-label">Price (₦) *</label>
                        <input
                          type="number"
                          className="dd-input"
                          value={portfolioForm.price}
                          onChange={e => setPortfolioForm(p => ({ ...p, price: e.target.value }))}
                          placeholder="e.g. 25000"
                          min="1"
                        />
                      </div>
                    )}
                  </div>

                  <button className="dd-save-btn" onClick={handlePortfolioUpload} disabled={uploading || !portfolioForm.image}>
                    {uploading ? 'Uploading...' : '↑ Add Design'}
                  </button>
                </div>

                {/* Existing designs */}
                <div className="dd-card">
                  <p className="dd-card-title">Your Designs ({profile?.portfolio?.length || 0})</p>
                  {!profile?.portfolio?.length ? (
                    <div className="dd-empty-portfolio">
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>◈</div>
                      <p>No designs yet — add your first piece above</p>
                    </div>
                  ) : (
                    <div className="dd-portfolio-grid">
                      {profile.portfolio.map((item) => (
                        <div key={item._id} className="dd-portfolio-item">
                          <div className="dd-portfolio-img-wrap">
                            <img src={item.image} alt={item.title} />
                          </div>
                          <div className="dd-portfolio-title">{item.title}</div>
                          {item.category && (
                            <div className="dd-portfolio-category">{formatLabel(item.category)}</div>
                          )}

                          {/*  For sale badge + price */}
                          {item.isForSale && item.price > 0 ? (
                            <div className="dd-portfolio-forsale">
                              🛒 For Sale · ₦{item.price.toLocaleString()}
                            </div>
                          ) : (
                            <div className="dd-portfolio-custom">
                              💬 Custom Orders Only
                            </div>
                          )}

                          <div className="dd-portfolio-actions">
                            <button className="dd-portfolio-edit" onClick={() => setEditingItem(item)} title="Edit design">
                              ✎ Edit
                            </button>
                            <button className="dd-portfolio-delete" onClick={() => handleDeletePortfolio(item._id)} title="Remove design">
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {editingItem && (
        <EditDesignModal
          item={editingItem}
          onSave={handleEditDesign}
          onClose={() => setEditingItem(null)}
        />
      )}

      <Toast toasts={toasts} />
    </>
  );
}
