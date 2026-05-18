import { useState, useEffect, useRef } from 'react';
import { G4 } from '../assets/Index';
import { API_BASE } from '../config';


const Bell = ({ notifCount, notifOpen, setNotifOpen, markNotifsRead, notifs }) => (
  <div style={{ position: 'relative' }}>
    <button
      className="nav-messages-icon"
      title="Notifications"
      onClick={() => {
        setNotifOpen(!notifOpen);
        if (notifCount > 0) markNotifsRead();
      }}
      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
    >
      🔔
      {notifCount > 0 && (
        <span className="nav-messages-badge">
          {notifCount > 99 ? '99+' : notifCount}
        </span>
      )}
    </button>

    {notifOpen && (
      <div className="nav-notif-dropdown">
        <div className="nav-notif-header">Notifications</div>
          {notifs.length === 0 ? (
        <div className="nav-notif-empty">No notifications yet</div>
      ) : (
        notifs.map(n => (
          <a
            key={n._id}
            href={n.link || '#'}
            className={`nav-notif-item ${!n.read ? 'unread' : ''}`}
            onClick={() => setNotifOpen(false)}
          >
            <p>{n.message}</p>
            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
          </a>
        ))
      )}
      </div>
    )}
  </div>
);


const Header = () => {
 
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); //  message badge count
  const pollRef = useRef(null); // interval ref for cleanup
  const unreadPollRef = useRef(null);
  const [notifCount, setNotifCount]   = useState(0);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [notifs, setNotifs]           = useState([]);

 
    useEffect(() => {
      const stored = localStorage.getItem('mygarb_user');
      if (stored) {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);

        fetchNotifications();
        pollRef.current = setInterval(fetchNotifications, 30000);

        if (parsedUser.role === 'designer') {
          fetchUnreadCount();
          unreadPollRef.current = setInterval(fetchUnreadCount, 30000);
        }
      }
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
        if (unreadPollRef.current) clearInterval(unreadPollRef.current);
      };
    }, []);

  // Fetch all conversations and sum up unread counts for this user
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('mygarb_token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/mygarb/chat/conversations`, {
        headers: { 'x-auth-token': token }
      });

      if (!response.ok) return;

      const result = await response.json();
      if (!result.success) return;

      const storedUser = JSON.parse(localStorage.getItem('mygarb_user') || '{}');
      const userId = storedUser._id;

      // Sum unread counts across all conversations for this user
      const total = (result.data || []).reduce((sum, conv) => {
        const count = conv.unreadCount?.[userId] || 0;
        return sum + count;
      }, 0);

      setUnreadCount(total);
    } catch (err) {
      // Silently fail — badge just won't update, not a critical error
      console.error('Fetch unread count error:', err);
    }
  };

  const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem('mygarb_token');
    if (!token) return;
    const response = await fetch(`${API_BASE}/api/mygarb/notifications`, {
      headers: { 'x-auth-token': token }
    });
    if (!response.ok) return;
    const result = await response.json();
    if (result.success) {
      setNotifCount(result.unreadCount || 0);
      setNotifs(result.data || []);
    }
  } catch (err) {
    console.error('Fetch notifications error:', err);
  }
};

const markNotifsRead = async () => {
  try {
    const token = localStorage.getItem('mygarb_token');
    if (!token) return;
    await fetch(`${API_BASE}/api/mygarb/notifications/read-all`, {
      method: 'PUT',
      headers: { 'x-auth-token': token }
    });
    setNotifCount(0);
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  } catch (err) {
    console.error('Mark read error:', err);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('mygarb_token');
    localStorage.removeItem('mygarb_user');
    if (pollRef.current) clearInterval(pollRef.current);
    if (unreadPollRef.current) clearInterval(unreadPollRef.current);
    setUser(null);
    window.location.href = '/';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.nav-dropdown-wrap')) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className='purple-strip'></div>
      <div className='nav-bar'>

        {/* Logo */}
        <div className='p-logo'>
          <h6>PHASIONABLE</h6>
        </div>

        {/* Nav links */}
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
              {user.role === 'designer' ? (
                /* ── Designer: messages icon + dashboard + dropdown ── */
                <>
                <Bell
                  notifCount={notifCount}
                  notifOpen={notifOpen}
                  setNotifOpen={setNotifOpen}
                  markNotifsRead={markNotifsRead}
                  notifs={notifs}
                />
                  {/* Message icon with unread badge */}
                  <a href="/chat" className="nav-messages-icon" title="Messages">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="nav-messages-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </a>

                  <a href="/dashboard" className="btn-signup">
                    My Dashboard
                  </a>

                  <div className="nav-dropdown-wrap" style={{ position: 'relative' }}>
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
                        <a href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</a>
                        <a href="/chat" onClick={() => setMenuOpen(false)}>
                          Messages
                          {unreadCount > 0 && (
                            <span className="nav-dropdown-badge">{unreadCount}</span>
                          )}
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
                  <Bell
                    notifCount={notifCount}
                    notifOpen={notifOpen}
                    setNotifOpen={setNotifOpen}
                    markNotifsRead={markNotifsRead}
                    notifs={notifs}
                  />
                  <div className="nav-dropdown-wrap" style={{ position: 'relative' }}>
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
                        <a href="/chat" onClick={() => setMenuOpen(false)}>Messages</a>
                        <button onClick={handleLogout}>Log out</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            /* ── Logged out ── */
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
