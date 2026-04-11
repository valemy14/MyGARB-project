import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearUserCart } from '../utils/cartHelpers';

const SPECIALTIES = [
  'suits', 'native_wear_men', 'native_wear_women', 'wedding_dresses',
  'casual_wear', 'corporate_wear', 'traditional_attire', 'unisex', 'children'
];

function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // ✅ NEW: designer profile fields
  const [designerData, setDesignerData] = useState({
    businessName: '',
    bio: '',
    specialties: [],
    startingPrice: ''
  });

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleContinue = () => {
    if (!selectedRole) { setError('Please select a role'); return; }
    setError('');
    setStep(2);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleDesignerChange = (e) => {
    setDesignerData({ ...designerData, [e.target.name]: e.target.value });
    setError('');
  };

  // ✅ NEW: toggle specialty selection
  const toggleSpecialty = (s) => {
    setDesignerData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter(x => x !== s)
        : [...prev.specialties, s]
    }));
  };

  // Step 2 → Step 3 (designers only) or submit (customers)
  const handleStep2Continue = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (formData.password.length < 5) {
      setError('Password must be at least 5 characters'); return;
    }

    // Customers submit directly, designers go to step 3
    if (selectedRole === 'designer') {
      setStep(3);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // Validate designer fields on step 3
    if (selectedRole === 'designer') {
      if (!designerData.businessName.trim()) {
        setError('Business name is required'); return;
      }
      if (designerData.bio.trim().length < 50) {
        setError('Bio must be at least 50 characters'); return;
      }
      if (designerData.specialties.length === 0) {
        setError('Please select at least one specialty'); return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        // Designer profile fields sent along
        ...(selectedRole === 'designer' && {
          businessName: designerData.businessName.trim(),
          bio: designerData.bio.trim(),
          specialties: designerData.specialties,
          startingPrice: designerData.startingPrice ? Number(designerData.startingPrice) : undefined
        })
      };

      const response = await fetch('http://localhost:5000/api/mygarb/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const token = response.headers.get('x-auth-token');
      const userData = await response.json();

      if (!response.ok) throw new Error(userData.error || 'Registration failed');

      localStorage.setItem('mygarb_token', token);
      localStorage.setItem('mygarb_user', JSON.stringify(userData));
      clearUserCart();

      // ✅ Designer goes to their profile to complete setup, customer goes home
      if (selectedRole === 'designer') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }

    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page signup-page">
      <div className="auth-container">

        {/* ── Step 1: Role Selection ── */}
        {step === 1 && (
          <div className="auth-content">
            <div className="auth-logo"><div className="logo-circle"></div></div>
            <h1>Create Your Account</h1>
            <p className="auth-subtitle">Choose your role to get started</p>

            <div className="role-selection">
              <button
                className={`role-btn ${selectedRole === 'customer' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('customer')}
              >
                <span className="role-icon">👤</span>
                <span className="role-label">Customer</span>
                <span className="role-desc">I want to hire a designer</span>
              </button>
              <button
                className={`role-btn ${selectedRole === 'designer' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('designer')}
              >
                <span className="role-icon">✂️</span>
                <span className="role-label">Designer</span>
                <span className="role-desc">I create custom designs</span>
              </button>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="btn-auth-primary" onClick={handleContinue}>
              Continue
            </button>

            <p className="auth-footer">
              Already have an account? <a href="/login">Log in</a>
            </p>
          </div>
        )}

        {/* ── Step 2: Account Details ── */}
        {step === 2 && (
          <div className="auth-content">
            <div className="auth-logo"><div className="logo-circle"></div></div>
            <h1>Complete Your Profile</h1>
            <p className="auth-subtitle">
              Creating account as <strong>{selectedRole}</strong>
              {selectedRole === 'designer' && ' — Step 1 of 2'}
            </p>

            <form onSubmit={handleStep2Continue} className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name}
                  onChange={handleChange} placeholder="Enter your full name" required />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="Enter your email" required />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input type={showPassword ? 'text' : 'password'} name="password"
                    value={formData.password} onChange={handleChange}
                    placeholder="Create a password" required />
                  <button type="button" className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="password-input-wrapper">
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleChange}
                    placeholder="Confirm your password" required />
                  <button type="button" className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="btn-auth-primary" disabled={loading}>
                {selectedRole === 'designer' ? 'Next: Designer Details →' : (loading ? 'Creating Account...' : 'Create Account')}
              </button>

              <button type="button" className="btn-auth-back" onClick={() => setStep(1)}>
                ← Back to Role Selection
              </button>
            </form>

            <p className="auth-footer">
              Already have an account? <a href="/login">Log in</a>
            </p>
          </div>
        )}

        {/* ── Step 3: Designer Profile (designers only) ── */}
        {step === 3 && (
          <div className="auth-content">
            <div className="auth-logo"><div className="logo-circle"></div></div>
            <h1>Your Designer Profile</h1>
            <p className="auth-subtitle">Step 2 of 2 — Tell clients about yourself</p>

            <div className="auth-form">
              <div className="form-group">
                <label>Business / Studio Name *</label>
                <input type="text" name="businessName" value={designerData.businessName}
                  onChange={handleDesignerChange}
                  placeholder="e.g. Adire by Tola" />
              </div>

              <div className="form-group">
                <label>Bio * <span style={{ fontWeight: 400, fontSize: '0.8rem', color: '#888' }}>
                  (min 50 characters — {designerData.bio.length}/50)
                </span></label>
                <textarea name="bio" value={designerData.bio}
                  onChange={handleDesignerChange} rows={4}
                  placeholder="Tell clients about your style, experience, and what makes you unique..." />
              </div>

              <div className="form-group">
                <label>Specialties * <span style={{ fontWeight: 400, fontSize: '0.8rem', color: '#888' }}>
                  (select all that apply)
                </span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {SPECIALTIES.map(s => (
                    <button key={s} type="button"
                      onClick={() => toggleSpecialty(s)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: `1px solid ${designerData.specialties.includes(s) ? '#8B5CF6' : '#ddd'}`,
                        background: designerData.specialties.includes(s) ? '#8B5CF6' : 'white',
                        color: designerData.specialties.includes(s) ? 'white' : '#666',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}>
                      {s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Starting Price (₦) <span style={{ fontWeight: 400, fontSize: '0.8rem', color: '#888' }}>
                  (optional)
                </span></label>
                <input type="number" name="startingPrice" value={designerData.startingPrice}
                  onChange={handleDesignerChange} placeholder="e.g. 25000" />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button className="btn-auth-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Designer Account'}
              </button>

              <button type="button" className="btn-auth-back" onClick={() => setStep(2)}>
                ← Back
              </button>
            </div>

            <p className="auth-footer">
              Already have an account? <a href="/login">Log in</a>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Signup;
