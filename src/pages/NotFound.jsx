import React from 'react';
import { Compass, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="page-container d-flex flex-column align-items-center justify-content-center text-center animate-fade-in">
      <Compass size={100} color="var(--color-primary)" className="mb-4" style={{ opacity: 0.5 }} />
      <h1 className="display-1 fw-bold mb-2" style={{ color: 'var(--color-primary)' }}>404</h1>
      <h2 className="mb-3">Off the Beaten Path</h2>
      <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>
        It looks like you've ventured into uncharted territory. The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary d-flex align-items-center gap-2 px-4">
        <Home size={18} /> Return Home
      </Link>
    </div>
  );
};

export default NotFound;
