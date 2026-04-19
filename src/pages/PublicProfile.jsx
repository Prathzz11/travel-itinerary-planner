import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Copy, Clock, DollarSign, Activity } from 'lucide-react';
import { ExploreContext } from '../contexts/ExploreContext';

const PublicProfile = () => {
  const { id } = useParams();
  const { getTripsByUser } = useContext(ExploreContext);
  
  const userTrips = getTripsByUser(id);
  
  if (!userTrips || userTrips.length === 0) {
    return <div className="page-container glass-panel"><h2 style={{textAlign: 'center', margin: 'auto'}}>User not found or has no public trips.</h2></div>;
  }

  // Derive user info from their first trip
  const user = userTrips[0].author;
  
  // Calculate stats
  const totalForks = userTrips.reduce((sum, trip) => sum + trip.forks, 0);
  const avgRating = (userTrips.reduce((sum, trip) => sum + parseFloat(trip.rating), 0) / userTrips.length).toFixed(1);

  return (
    <div className="page-container" style={{ padding: 'var(--space-8)' }}>
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 'var(--space-8)', background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%)' }}>
        <img src={user.avatar} alt={user.name} style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid var(--color-primary)', marginBottom: 'var(--space-4)', objectFit: 'cover' }} />
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 var(--space-2) 0' }}>{user.name}</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 0 var(--space-6) 0' }}>{user.bio || 'Traveler and itinerary creator.'}</p>
        
        <div style={{ display: 'flex', gap: 'var(--space-6)', background: 'rgba(0,0,0,0.2)', padding: 'var(--space-4) var(--space-8)', borderRadius: 'var(--radius-full)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{userTrips.length}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Trips</div>
          </div>
          <div style={{ width: '1px', background: 'var(--color-border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{totalForks}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Forks</div>
          </div>
          <div style={{ width: '1px', background: 'var(--color-border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>{avgRating} <Star size={16} fill="#fbbf24" /></div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Avg Rating</div>
          </div>
        </div>
      </motion.div>

      <h2 style={{ fontSize: '1.8rem', marginBottom: 'var(--space-6)' }}>Public Itineraries by {user.name}</h2>
      
      {/* Trips Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        {userTrips.map((item) => (
          <motion.div 
            whileHover={{ y: -5 }}
            key={item.id} 
            className="glass-panel" 
            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ position: 'relative', height: '200px' }}>
              <img src={item.image} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                <Star size={12} color="#fbbf24" fill="#fbbf24" /> {item.rating}
              </div>
            </div>

            <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{item.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                <MapPin size={12} /> {item.destination}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} color="var(--color-secondary)" /> {item.durationDays} Days</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} color="var(--color-success)" /> {item.budget} {item.currency}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={14} color="var(--color-accent)" /> {item.difficulty}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Copy size={14} color="var(--color-primary)" /> {item.forks} Forks</span>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Link to={`/itinerary/${item.id}`} style={{ display: 'block', textAlign: 'center', background: 'var(--color-primary)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
                  View Itinerary
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PublicProfile;
