import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Globe, Code2, Camera, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid var(--color-border)',
      padding: 'var(--space-8) var(--space-6)',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--space-8)'
      }}>
        
        {/* Brand Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none' }}>
            <Compass color="var(--color-primary)" size={28} />
            <h2 className="text-gradient" style={{ margin: 0, fontSize: '1.25rem' }}>TravelSync</h2>
          </Link>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            Plan, organize, and experience your dream vacations with powerful tools and an immersive 3D interface.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <a href="#" aria-label="Twitter / X" style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--color-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--color-text-muted)'}><Globe size={20} /></a>
            <a href="#" aria-label="Instagram" style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='var(--color-secondary)'} onMouseOut={e => e.currentTarget.style.color='var(--color-text-muted)'}><Camera size={20} /></a>
            <a href="#" aria-label="GitHub" style={{ color: 'var(--color-text-muted)', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color='white'} onMouseOut={e => e.currentTarget.style.color='var(--color-text-muted)'}><Code2 size={20} /></a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'white' }}>Platform</h3>
          <Link to="/explore" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }} onMouseOver={e => e.currentTarget.style.color='var(--color-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--color-text-muted)'}>Explore Trips</Link>
          <Link to="/dashboard" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }} onMouseOver={e => e.currentTarget.style.color='var(--color-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--color-text-muted)'}>Dashboard</Link>
          <Link to="/create-trip" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }} onMouseOver={e => e.currentTarget.style.color='var(--color-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--color-text-muted)'}>Create Trip</Link>
          <Link to="/profile" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }} onMouseOver={e => e.currentTarget.style.color='var(--color-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--color-text-muted)'}>My Profile</Link>
        </div>

        {/* Links Column 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'white' }}>Company</h3>
          <Link to="/about" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }} onMouseOver={e => e.currentTarget.style.color='var(--color-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--color-text-muted)'}>About Us</Link>
          <Link to="/careers" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }} onMouseOver={e => e.currentTarget.style.color='var(--color-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--color-text-muted)'}>Careers</Link>
          <Link to="/privacy" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }} onMouseOver={e => e.currentTarget.style.color='var(--color-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--color-text-muted)'}>Privacy Policy</Link>
          <Link to="/terms" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '0.9rem' }} onMouseOver={e => e.currentTarget.style.color='var(--color-primary)'} onMouseOut={e => e.currentTarget.style.color='var(--color-text-muted)'}>Terms of Service</Link>
        </div>

        {/* Contact Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'white' }}>Get in Touch</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Have questions or want to partner with us?
          </p>
          <a href="mailto:hello@travelsync.app" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, marginTop: '8px' }}>
            <Mail size={16} /> hello@travelsync.app
          </a>
        </div>

      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: 'var(--space-8) auto 0', 
        paddingTop: 'var(--space-6)', 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
          &copy; {new Date().getFullYear()} TravelSync Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
