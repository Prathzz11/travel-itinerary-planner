import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy } from 'lucide-react';

const ForkItinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="page-container d-flex align-items-center justify-content-center">
      <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="card-body p-4 p-md-5 text-center">
          <div className="d-inline-flex p-3 rounded-circle mb-3" style={{ background: 'rgba(192, 132, 252, 0.1)' }}>
            <Copy size={32} color="var(--color-secondary)" />
          </div>
          <h2 className="fw-bold mb-2">Fork Itinerary</h2>
          <p className="text-muted mb-4">
            You are about to copy "Ultimate Japan Route" into your own trips. You can modify dates, activities, and budget once copied.
          </p>
          
          <div className="d-flex flex-column gap-3 mb-4">
            <input type="text" className="form-control" placeholder="New Trip Title" defaultValue="My Japan Trip" />
            <input type="date" className="form-control" style={{ colorScheme: 'dark' }} />
          </div>

          <div className="d-flex gap-3">
            <button className="btn btn-outline-secondary flex-grow-1" onClick={() => navigate(-1)}>Cancel</button>
            <button className="btn btn-primary flex-grow-1" onClick={() => navigate('/dashboard')}>Create Copy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForkItinerary;