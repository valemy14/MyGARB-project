import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearUserCart } from '../utils/cartHelpers';

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

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 5) {
      setError('Password must be at least 5 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/mygarb/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: selectedRole
        })
      });

      // Get token from header
      const token = response.headers.get('x-auth-token');
      
      // Get user data from body
      const userData = await response.json();

      if (!response.ok) {
        throw new Error(userData.error || 'Registration failed');
      }

      // Save token and user data
      localStorage.setItem('mygarb_token', token);
      localStorage.setItem('mygarb_user', JSON.stringify(userData));

      // New user starts with empty cart
      clearUserCart();

      // Success!
      alert('Account created successfully! Welcome to MYGARB!');
      navigate('/');

    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page signup-page">
      <div className="auth-container">
        
        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="auth-content">
            <div className="auth-logo">
              <div className="logo-circle"></div>
            </div>

            <h1>Create Your Account</h1>
            <p className="auth-subtitle">Choose your role to get started</p>

            <div className="role-selection">
              <button
                className={`role-btn ${selectedRole === 'customer' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('customer')}
              >
                <span className="role-icon">👔</span>
                <span className="role-label">Customer</span>
              </button>

              <button
                className={`role-btn ${selectedRole === 'tailor' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('tailor')}
              >
                <span className="role-icon">✂️</span>
                <span className="role-label">Tailor</span>
              </button>

              <button
                className={`role-btn ${selectedRole === 'vendor' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('vendor')}
              >
                <span className="role-icon">🏪</span>
                <span className="role-label">Vendor</span>
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

        {/* Step 2: Account Details */}
        {step === 2 && (
          <div className="auth-content">
            <div className="auth-logo">
              <div className="logo-circle"></div>
            </div>

            <h1>Complete Your Profile</h1>
            <p className="auth-subtitle">
              Creating account as <strong>{selectedRole}</strong>
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="btn-auth-primary" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
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

      </div>
    </div>
  );
}

export default Signup;