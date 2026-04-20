import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Copy, Clock, DollarSign, Activity, Edit3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ExploreContext } from '../contexts/ExploreContext';

const Profile = () => {
  const { user } = useAuth();
  const { getTripsByUser } = useContext(ExploreContext);
  const myTrips = getTripsByUser('user1') || [];
  const totalForks = myTrips.reduce((sum, trip) => sum + trip.forks, 0);
  const avgRating = myTrips.length > 0 ? (myTrips.reduce((sum, trip) => sum + parseFloat(trip.rating), 0) / myTrips.length).toFixed(1) : '0.0';

  return (
    <div className="page-container animate-fade-in">
      {/* Profile Header */}
      <div className="card mb-4 position-relative">
        <div className="card-body p-4 p-md-5 text-center">
          <Link to="/settings" className="btn btn-outline-secondary btn-sm position-absolute top-0 end-0 m-3 d-flex align-items-center gap-1">
            <Edit3 size={14} /> Edit Profile
          </Link>
          <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`} alt="Profile" className="rounded-circle mb-3" style={{ width: 120, height: 120, objectFit: 'cover', border: '4px solid var(--color-primary)' }} />
          <h1 className="display-6 fw-bold mb-1">{user?.name || 'Explorer'}</h1>
          <p className="text-muted mb-4" style={{ maxWidth: 600, margin: '0 auto' }}>{user?.bio || 'Add a bio in your account settings.'}</p>
          
          <div className="d-flex justify-content-center gap-4 p-3 rounded-3 mx-auto" style={{ background: 'rgba(0,0,0,0.2)', maxWidth: 400 }}>
            <div className="text-center flex-fill">
              <div className="fs-4 fw-bold" style={{ color: 'var(--color-primary)' }}>{myTrips.length}</div>
              <div className="text-muted small text-uppercase">Trips</div>
            </div>
            <div className="vr"></div>
            <div className="text-center flex-fill">
              <div className="fs-4 fw-bold" style={{ color: 'var(--color-secondary)' }}>{totalForks}</div>
              <div className="text-muted small text-uppercase">Forks</div>
            </div>
            <div className="vr"></div>
            <div className="text-center flex-fill">
              <div className="fs-4 fw-bold d-flex align-items-center justify-content-center gap-1" style={{ color: '#fbbf24' }}>{avgRating} <Star size={16} fill="#fbbf24" /></div>
              <div className="text-muted small text-uppercase">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="fs-3 mb-4">My Public Itineraries</h2>
      
      {myTrips.length > 0 ? (
        <div className="row g-4 stagger-children">
          {myTrips.map((item) => (
            <div className="col-md-6 col-lg-4" key={item.id}>
              <div className="card hover-lift h-100">
                <div className="position-relative" style={{ height: 200 }}>
                  <img src={item.image} alt={item.title} loading="lazy" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  <span className="badge position-absolute top-0 end-0 m-2 d-flex align-items-center gap-1" style={{ background: 'rgba(0,0,0,0.6)' }}>
                    <Star size={12} color="#fbbf24" fill="#fbbf24" /> {item.rating}
                  </span>
                </div>
                <div className="card-body d-flex flex-column">
                  <h3 className="fs-5 fw-semibold mb-1">{item.title}</h3>
                  <div className="text-muted small mb-3 d-flex align-items-center gap-1"><MapPin size={12} /> {item.destination}</div>
                  <div className="row g-2 mb-3 small">
                    <div className="col-6 d-flex align-items-center gap-1"><Clock size={14} color="var(--color-secondary)" /> {item.durationDays} Days</div>
                    <div className="col-6 d-flex align-items-center gap-1"><DollarSign size={14} color="var(--color-success)" /> {item.budget} {item.currency}</div>
                    <div className="col-6 d-flex align-items-center gap-1"><Activity size={14} color="var(--color-accent)" /> {item.difficulty}</div>
                    <div className="col-6 d-flex align-items-center gap-1"><Copy size={14} color="var(--color-primary)" /> {item.forks} Forks</div>
                  </div>
                  <div className="mt-auto pt-3 border-top">
                    <Link to={`/itinerary/${item.id}`} className="btn btn-primary w-100 btn-sm">View Itinerary</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-5">
          <p className="text-muted mb-0">You haven't published any itineraries yet.</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
