import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Compass, LayoutDashboard, BookMarked, LogOut, ChevronDown, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getAvatarInitials } from '../utils/itineraryHelpers.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link${isActive ? ' nav-link-active' : ''}`;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <Compass size={22} />
          <span>TripPlanner</span>
        </Link>

        <div className={`nav-links${menuOpen ? ' open' : ''}`}>
          <NavLink to="/" className={navLinkClass} end onClick={() => setMenuOpen(false)}>
            <Home size={16} />
            <span>Home</span>
          </NavLink>
          <NavLink to="/browse" className={navLinkClass} onClick={() => setMenuOpen(false)}>
            <Compass size={16} />
            <span>Browse</span>
          </NavLink>
          {user && (
            <>
              <NavLink to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/my-templates" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                <BookMarked size={16} />
                <span>My Templates</span>
              </NavLink>
            </>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDropdownOpen(false); }} tabIndex={-1}>
              <button className="avatar-btn" onClick={() => setDropdownOpen((p) => !p)}>
                <span className="avatar-circle">{getAvatarInitials(user.username || user.name || '')}</span>
                <span className="hide-mobile">{user.username || user.name}</span>
                <ChevronDown size={14} />
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span className="dropdown-username">{user.username || user.name}</span>
                    <span className="dropdown-email">{user.email}</span>
                  </div>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
          <button className="hamburger hide-desktop" onClick={() => setMenuOpen((p) => !p)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <style>{`
        .navbar { background: #fff; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100; height: 64px; }
        .navbar-inner { display: flex; align-items: center; justify-content: space-between; height: 100%; gap: 1.5rem; }
        .navbar-brand { display: flex; align-items: center; gap: 0.5rem; font-weight: 800; font-size: 1.1rem; color: #2563eb; text-decoration: none; flex-shrink: 0; }
        .nav-links { display: flex; align-items: center; gap: 0.25rem; }
        .nav-link { display: flex; align-items: center; gap: 0.3rem; padding: 0.45rem 0.75rem; border-radius: 8px; color: #64748b; font-size: 0.9rem; text-decoration: none; transition: all 0.15s; }
        .nav-link:hover { background: #f1f5f9; color: #1e293b; text-decoration: none; }
        .nav-link-active { background: #dbeafe; color: #2563eb; font-weight: 600; }
        .navbar-actions { display: flex; align-items: center; gap: 0.75rem; }
        .auth-btns { display: flex; align-items: center; gap: 0.5rem; }
        .avatar-btn { display: flex; align-items: center; gap: 0.4rem; background: none; border: 1.5px solid #e2e8f0; border-radius: 50px; padding: 0.3rem 0.75rem 0.3rem 0.3rem; cursor: pointer; font-size: 0.88rem; color: #1e293b; transition: border-color 0.15s; }
        .avatar-btn:hover { border-color: #2563eb; }
        .avatar-circle { width: 28px; height: 28px; border-radius: 50%; background: #dbeafe; color: #2563eb; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .user-menu { position: relative; }
        .dropdown-menu { position: absolute; right: 0; top: calc(100% + 8px); background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); min-width: 200px; z-index: 200; padding: 0.5rem; }
        .dropdown-header { padding: 0.5rem 0.75rem; }
        .dropdown-username { display: block; font-weight: 700; font-size: 0.9rem; }
        .dropdown-email { display: block; font-size: 0.78rem; color: #64748b; }
        .dropdown-divider { border: none; border-top: 1px solid #e2e8f0; margin: 0.4rem 0; }
        .dropdown-item { display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.5rem 0.75rem; border: none; background: none; cursor: pointer; font-size: 0.88rem; color: #1e293b; border-radius: 6px; transition: background 0.15s; }
        .dropdown-item:hover { background: #f1f5f9; }
        .hamburger { background: none; border: none; cursor: pointer; color: #1e293b; display: flex; align-items: center; }
        @media (max-width: 768px) {
          .nav-links { display: none; position: fixed; top: 64px; left: 0; right: 0; background: #fff; border-bottom: 1px solid #e2e8f0; flex-direction: column; align-items: stretch; padding: 0.75rem; gap: 0.25rem; z-index: 99; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .nav-links.open { display: flex; }
          .nav-link { font-size: 1rem; padding: 0.7rem 1rem; }
          .hide-desktop { display: flex; }
        }
        @media (min-width: 769px) {
          .hide-desktop { display: none; }
        }
      `}</style>
    </nav>
  );
}
