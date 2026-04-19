import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Scene3D from '../3d/Scene3D';
import { Compass, LogOut, Menu, X, ChevronDown, User, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Footer from './Footer';

const Layout = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const dropdownRef = React.useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NavItem = ({ to, children, onClick }) => {
    const isActive = location.pathname.startsWith(to) && (to !== '/' || location.pathname === '/');
    return (
      <Link to={to} onClick={onClick} style={{ 
        fontWeight: 500, 
        color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
        borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
        paddingBottom: '4px',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center'
      }}>
        {children}
      </Link>
    );
  };

  return (
    <>
      {/* Skip to Main Content Link for Keyboard Users */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* 3D Background */}
      <div aria-hidden="true" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 'var(--z-scene)' }}>
        <Scene3D />
      </div>

      {/* Glassmorphism Header */}
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '80px',
        zIndex: 'var(--z-overlay)',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        borderBottom: 'var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-6)',
      }}>
        <nav aria-label="Main Navigation" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Compass aria-hidden="true" color="var(--color-primary)" size={32} />
          <h1 className="text-gradient" style={{ margin: 0, fontSize: '1.5rem' }}>TravelSync</h1>
        </Link>
        <div className="hide-on-mobile" style={{ gap: 'var(--space-6)', alignItems: 'center', display: 'flex' }}>
          <NavItem to="/explore">Explore</NavItem>
          {user ? (
            <>
              <NavItem to="/dashboard">Dashboard</NavItem>
              
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{ 
                    background: 'transparent', border: 'none', color: 'var(--color-text)', 
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    padding: '4px', borderRadius: 'var(--radius-full)'
                  }}
                >
                  <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--color-border)', objectFit: 'cover' }} />
                  <ChevronDown size={16} color="var(--color-text-muted)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute',
                        top: '100%', right: 0, marginTop: '8px',
                        background: 'rgba(30, 41, 59, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 0',
                        minWidth: '200px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                        display: 'flex', flexDirection: 'column'
                      }}
                    >
                      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border)', marginBottom: '4px' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>{user.name}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{user.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setIsDropdownOpen(false)} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', textDecoration: 'none', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/settings" onClick={() => setIsDropdownOpen(false)} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', textDecoration: 'none', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                        <SettingsIcon size={16} /> Settings
                      </Link>
                      <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />
                      <button 
                        onClick={() => { logout(); setIsDropdownOpen(false); }} 
                        style={{ 
                          background: 'transparent', border: 'none', color: 'var(--color-danger)', 
                          padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', 
                          cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: '1rem',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'} onMouseOut={e => e.currentTarget.style.background='transparent'}
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link to="/login" style={{ fontWeight: 600, background: 'var(--color-primary)', color: 'white', padding: '8px 20px', borderRadius: 'var(--radius-full)', textDecoration: 'none', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.boxShadow='0 0 15px var(--color-primary-glow)'} onMouseOut={e => e.currentTarget.style.boxShadow='none'}>
              Login / Sign Up
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="show-on-mobile" 
          onClick={() => setIsMobileMenuOpen(true)}
          style={{ background: 'transparent', color: 'var(--color-text)', border: 'none', cursor: 'pointer' }}
          aria-label="Open mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu aria-hidden="true" size={28} />
        </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 'calc(var(--z-overlay) + 1)',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              padding: 'var(--space-6)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', marginTop: '-24px', marginBottom: 'var(--space-8)' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }} onClick={() => setIsMobileMenuOpen(false)}>
                <Compass color="var(--color-primary)" size={32} />
                <h1 className="text-gradient" style={{ margin: 0, fontSize: '1.5rem' }}>TravelSync</h1>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ background: 'transparent', color: 'var(--color-text)', border: 'none', cursor: 'pointer' }}
                aria-label="Close mobile menu"
              >
                <X aria-hidden="true" size={28} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', fontSize: '1.5rem', textAlign: 'center', marginTop: 'var(--space-8)' }}>
              <NavItem to="/explore" onClick={() => setIsMobileMenuOpen(false)}>Explore Gallery</NavItem>
              {user ? (
                <>
                  <NavItem to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavItem>
                  <NavItem to="/profile" onClick={() => setIsMobileMenuOpen(false)}>My Profile</NavItem>
                  <NavItem to="/settings" onClick={() => setIsMobileMenuOpen(false)}>Settings</NavItem>
                  <button 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', fontWeight: 600, cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: 'var(--space-4)' }}
                  >
                    <LogOut size={24} /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Login / Sign Up</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main id="main-content" style={{
        position: 'relative',
        zIndex: 'var(--z-content)',
        height: '100vh',
        width: '100vw',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '80px'
      }}>
        <div style={{ width: '100%', display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center' }}>
          <Outlet />
        </div>
        <Footer />
      </main>
    </>
  );
};

export default Layout;
