import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, User, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Footer from './Footer';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown on route change
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/bg-globe.mp4" type="video/mp4" />
      </video>

      {/* Skip to Main Content */}
      <a href="#main-content" className="visually-hidden-focusable position-absolute top-0 start-0 m-2 btn btn-primary">
        Skip to main content
      </a>

      {/* Bootstrap Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
        <div className="container-fluid px-3 px-lg-4">
          {/* Brand */}
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img src="/navigation.png" alt="TravelSync Logo" style={{ height: '40px', width: 'auto' }} />
            <span className="text-gradient">TravelSync</span>
          </Link>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <Menu size={24} />
          </button>

          {/* Collapsible Nav */}
          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/explore') ? 'active fw-semibold' : ''}`} to="/explore">
                  Explore
                </Link>
              </li>

              {user ? (
                <>
                  <li className="nav-item">
                    <Link className={`nav-link ${isActive('/dashboard') ? 'active fw-semibold' : ''}`} to="/dashboard">
                      Dashboard
                    </Link>
                  </li>

                  {/* User Dropdown */}
                  <li className="nav-item dropdown" ref={dropdownRef}>
                    <button
                      className="btn btn-link nav-link d-flex align-items-center gap-2 dropdown-toggle"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      aria-expanded={isDropdownOpen}
                    >
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                        alt="Profile"
                        className="rounded-circle"
                        style={{ width: '30px', height: '30px', objectFit: 'cover', border: '2px solid var(--color-border)' }}
                      />
                      <span className="d-none d-lg-inline">{user.name}</span>
                    </button>

                    <ul className={`dropdown-menu dropdown-menu-end ${isDropdownOpen ? 'show' : ''}`}
                        style={{ background: '#1e293b', border: '1px solid var(--color-border)' }}>
                      <li>
                        <div className="dropdown-item-text text-muted small">
                          {user.email}
                        </div>
                      </li>
                      <li><hr className="dropdown-divider" style={{ borderColor: 'var(--color-border)' }} /></li>
                      <li>
                        <Link className="dropdown-item d-flex align-items-center gap-2" to="/profile" onClick={() => setIsDropdownOpen(false)}>
                          <User size={16} /> My Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item d-flex align-items-center gap-2" to="/settings" onClick={() => setIsDropdownOpen(false)}>
                          <SettingsIcon size={16} /> Settings
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" style={{ borderColor: 'var(--color-border)' }} /></li>
                      <li>
                        <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={() => { logout(); setIsDropdownOpen(false); }}>
                          <LogOut size={16} /> Logout
                        </button>
                      </li>
                    </ul>
                  </li>
                </>
              ) : (
                <li className="nav-item ms-lg-2">
                  <Link className="btn btn-primary px-4" to="/login">
                    Login / Sign Up
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main id="main-content" style={{ paddingTop: '76px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="flex-grow-1 d-flex flex-column align-items-center w-100">
          <Outlet />
        </div>
        <Footer />
      </main>
    </>
  );
};

export default Layout;
