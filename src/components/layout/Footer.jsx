import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Globe, Code2, Camera, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark border-top" style={{ borderColor: 'var(--color-border) !important' }}>
      <div className="container py-5">
        <div className="row g-4">
          
          {/* Brand Column */}
          <div className="col-lg-3 col-md-6">
            <Link to="/" className="d-flex align-items-center gap-2 mb-3 text-decoration-none">
              <Compass color="var(--color-primary)" size={28} />
              <h2 className="text-gradient mb-0 fs-5">TravelSync</h2>
            </Link>
            <p className="text-muted small mb-3">
              Plan, organize, and experience your dream vacations with powerful collaborative tools.
            </p>
            <div className="d-flex gap-3">
              <a href="#" aria-label="Website" className="text-muted"><Globe size={20} /></a>
              <a href="#" aria-label="Instagram" className="text-muted"><Camera size={20} /></a>
              <a href="#" aria-label="GitHub" className="text-muted"><Code2 size={20} /></a>
            </div>
          </div>

          {/* Platform Links */}
          <div className="col-lg-3 col-md-6">
            <h3 className="fs-6 fw-semibold mb-3">Platform</h3>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/explore" className="text-muted small text-decoration-none">The Atlas</Link></li>
              <li><Link to="/dashboard" className="text-muted small text-decoration-none">Control Room</Link></li>
              <li><Link to="/create-trip" className="text-muted small text-decoration-none">Initialize Journey</Link></li>
              <li><Link to="/profile" className="text-muted small text-decoration-none">Captain's Log</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-lg-3 col-md-6">
            <h3 className="fs-6 fw-semibold mb-3">Company</h3>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><Link to="/about" className="text-muted small text-decoration-none">About Us</Link></li>
              <li><Link to="/careers" className="text-muted small text-decoration-none">Careers</Link></li>
              <li><Link to="/privacy" className="text-muted small text-decoration-none">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted small text-decoration-none">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-3 col-md-6">
            <h3 className="fs-6 fw-semibold mb-3">Get in Touch</h3>
            <p className="text-muted small mb-2">Have questions or want to partner with us?</p>
            <a href="mailto:hello@travelsync.app" className="d-flex align-items-center gap-2 small fw-medium" style={{ color: 'var(--color-primary)' }}>
              <Mail size={16} /> hello@travelsync.app
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-top mt-4 pt-4 text-center" style={{ borderColor: 'var(--color-border) !important' }}>
          <p className="text-muted small mb-0">
            &copy; {new Date().getFullYear()} TravelSync Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
