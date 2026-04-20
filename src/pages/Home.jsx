import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Users, Calendar, Compass } from 'lucide-react';

const Home = () => {
  return (
    <div className="page-container d-flex align-items-center justify-content-center">
      <div className="card p-4 p-md-5 text-center animate-fade-in" style={{ maxWidth: '800px' }}>
        <div className="card-body d-flex flex-column align-items-center gap-4">
          <div className="animate-scale-in">
            <Compass size={64} color="var(--color-primary)" />
          </div>
          
          <h1 className="display-4 fw-bold mb-0">
            Plan Your Next <span className="text-gradient">Adventure</span>
          </h1>
          
          <p className="lead text-muted" style={{ maxWidth: '600px' }}>
            Experience the future of travel planning. Build interactive itineraries, collaborate with friends, and explore destinations worldwide.
          </p>

          <div className="d-flex flex-wrap gap-3 justify-content-center mt-2">
            <Link to="/create-trip" className="btn btn-primary btn-lg d-flex align-items-center gap-2 px-4">
              <Map size={20} /> Start Planning
            </Link>
            <Link to="/explore" className="btn btn-outline-light btn-lg d-flex align-items-center gap-2 px-4">
              <Users size={20} /> Explore Public Trips
            </Link>
          </div>

          <div className="row g-4 mt-4 pt-4 border-top w-100 stagger-children" style={{ borderColor: 'var(--color-border) !important' }}>
            <Feature icon={<Map color="var(--color-primary)" size={28} />} title="Interactive Maps" desc="Plot your journey visually" />
            <Feature icon={<Users color="var(--color-secondary)" size={28} />} title="Collaborative" desc="Plan together seamlessly" />
            <Feature icon={<Calendar color="var(--color-accent)" size={28} />} title="Smart Itineraries" desc="Day-by-day visualizations" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Feature = ({ icon, title, desc }) => (
  <div className="col-md-4 text-center hover-lift" style={{ cursor: 'default' }}>
    <div className="d-inline-flex p-3 rounded-circle mb-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
      {icon}
    </div>
    <h3 className="fs-6 fw-semibold mb-1">{title}</h3>
    <p className="text-muted small mb-0">{desc}</p>
  </div>
);

export default Home;
