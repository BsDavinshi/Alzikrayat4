import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { avatarColor, initials } from '../utils/helpers';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-bs-theme') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    try {
      localStorage.setItem('alz-theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top alz-navbar" aria-label="Main navigation">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src="/logo.svg" width="36" height="36" alt="Alzikrayat logo" />
          <span className="brand-word">Alzikrayat</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavigation"
          aria-controls="mainNavigation"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavigation">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                <i className="bi bi-house" /> Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/gallery">
                <i className="bi bi-images" /> Gallery
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/albums">
                <i className="bi bi-journal-album" /> Albums
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">
                <i className="bi bi-info-circle" /> About Us
              </NavLink>
            </li>
          </ul>

          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2 navbar-actions">
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`} />
            </button>

            {user ? (
              <>
                <Link className="btn btn-sm btn-accent" to="/upload">
                  <i className="bi bi-cloud-arrow-up" /> Upload
                </Link>
                <Link
                  className="navbar-greeting d-flex align-items-center gap-2"
                  to={`/users/${user._id}`}
                >
                  <span
                    className="avatar avatar-sm"
                    style={{ background: avatarColor(user._id) }}
                  >
                    {initials(user.firstName, user.lastName)}
                  </span>
                  <span>Hi {user.firstName}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="btn btn-sm btn-danger"
                >
                  <i className="bi bi-box-arrow-right" /> Logout
                </button>
              </>
            ) : (
              <>
                <span className="navbar-text please-login">
                  <i className="bi bi-person-lock" /> Please Login
                </span>
                <Link className="btn btn-sm btn-outline-secondary" to="/login">
                  Login
                </Link>
                <Link className="btn btn-sm btn-accent" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
