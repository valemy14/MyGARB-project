import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserCart } from '../utils/cartHelpers';

function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/mygarb/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const userData = await response.json();

      if (!response.ok) {
        throw new Error(userData.error || userData.message || 'Login failed');
      }

      
      
      const token =
        userData.token ||           // { token: '...', name: '...', role: '...' }
        userData.data?.token ||     // { data: { token: '...', user: {...} } }
        response.headers.get('x-auth-token'); // fallback: header (unlikely)

      if (!token) {
        console.error('Login response:', userData); 
        throw new Error('Login succeeded but no token was returned. Check your backend login route.');
      }

      
      const userToSave = userData.user || userData.data?.user || userData;

      localStorage.setItem('mygarb_token', token);
      localStorage.setItem('mygarb_user', JSON.stringify(userToSave));

      // Check user's cart
      const userCart = getUserCart();
      console.log(`${userToSave.name}'s cart has ${userCart.length} item(s)`);

      // Redirect based on role
      if (userToSave.role === 'designer') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }

    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-container">
        <div className="auth-content">

          <div className="auth-logo">
            <div className="logo-circle">P</div>
          </div>

          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="auth-form">
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
                  placeholder="Enter your password"
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

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn-auth-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <a href="/signup">Sign up</a>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;
