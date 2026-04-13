import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, signout, token } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/analyze', label: 'Text Analysis', icon: '📊' },
    { path: '/spam', label: 'Spam Detection', icon: '🚫' },
    { path: '/grammar', label: 'Grammar Check', icon: '✅' }
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">📝</span>
          <span className="logo-text">Text Analyzer</span>
        </Link>

        {token && (
          <div className="nav-links">
            {navLinks.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`nav-link ${isActive(path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{icon}</span>
                <span className="nav-label">{label}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="nav-actions">
          {token ? (
            <>
              <div className="user-info">
                <span className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                <span className="user-name">{user?.name}</span>
              </div>
              <button onClick={signout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="btn-nav btn-signin">
                Sign In
              </Link>
              <Link to="/signup" className="btn-nav btn-signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;