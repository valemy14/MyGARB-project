import { useState, useEffect } from 'react';
import { G4 } from '../assets/Index';

const Header = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('mygarb_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mygarb_token');
    localStorage.removeItem('mygarb_user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <>
      <div className='purple-strip'></div>
      <div className='nav-bar'>

        {/* Logo — unchanged */}
        <div className='p-logo'>
          <h6>PHASIONABLE</h6>
        </div>

        {/* Nav links — unchanged */}
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/#how-it-works">HOW IT WORKS</a></li>
          <li><a href="/#features">Features</a></li>
          <li><a href="/#contact">Contact</a></li>
        </ul>

        {/* Right side */}
        <div className='nav-right'>
          {user ? (
            <>
              {/* ── Designer: dashboard button + dropdown ── */}
              {user.role === 'designer' ? (
                <>
                  <a href="/dashboard" className="btn-signup">
                    My Dashboard
                  </a>
                  <div style={{ position: 'relative' }}>
                    <button
                      className="btn-login"
                      onClick={() => setMenuOpen(!menuOpen)}
                      style={{ cursor: 'pointer' }}
                    >
                      {user.name?.split(' ')[0]} ▾
                    </button>
                    {menuOpen && (
                      <div className="nav-dropdown">
                        <div className="nav-dropdown-role">Designer</div>
                        <a href="/dashboard" onClick={() => setMenuOpen(false)}>
                          Dashboard
                        </a>
                        <button onClick={handleLogout}>Log out</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* ── Customer: cart + name + dropdown ── */
                <>
                  <a href="/cart">
                    <img className='cart-icon' src={G4} alt="Cart" />
                  </a>
                  <div style={{ position: 'relative' }}>
                    <button
                      className="btn-login"
                      onClick={() => setMenuOpen(!menuOpen)}
                      style={{ cursor: 'pointer' }}
                    >
                      {user.name?.split(' ')[0]} ▾
                    </button>
                    {menuOpen && (
                      <div className="nav-dropdown">
                        <div className="nav-dropdown-role">Customer</div>
                        <button onClick={handleLogout}>Log out</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            /* ── Logged out: exactly the same as your original ── */
            <>
              <a href="/cart">
                <img className='cart-icon' src={G4} alt="Cart" />
              </a>
              <a href="/login" className="btn-login">LOG IN</a>
              <a href="/signup" className="btn-signup">SIGN UP</a>
            </>
          )}
        </div>
      </div>

    </>
  );
};

export default Header;
