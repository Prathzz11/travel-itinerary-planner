import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Calendar, MapPin, TrendingUp, Compass, ChevronDown } from 'lucide-react';
import { useTrip } from '../hooks/useTrip';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';
import TripCard from '../components/trip/TripCard';
import EmptyState from '../components/ui/EmptyState';

const Dashboard = () => {
  const navigate = useNavigate();
  const { trips, deleteTrip } = useTrip();
  const [search, setSearch] = useLocalStorage('dashboard_search', '');
  const [timeFilter, setTimeFilter] = useLocalStorage('dashboard_timeFilter', 'all'); // 'all', 'upcoming', 'past'
  const [sortBy, setSortBy] = useLocalStorage('dashboard_sortBy', 'newest'); // 'newest', 'oldest', 'a-z', 'z-a'
  const [isLoading, setIsLoading] = useState(true);
  
  const debouncedSearch = useDebounce(search, 500);

  // Simulate loading state for skeletons
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    if (!trips) return { total: 0, upcoming: 0, countries: 0 };
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const upcomingCount = trips.filter(t => new Date(t.startDate) >= today).length;
    const uniqueDestinations = new Set(trips.map(t => t.destination)).size;
    
    return {
      total: trips.length,
      upcoming: upcomingCount,
      countries: uniqueDestinations
    };
  }, [trips]);

  const filteredTrips = useMemo(() => {
    if (!trips) return [];
    const today = new Date();
    today.setHours(0,0,0,0);

    let result = trips.filter(trip => {
      const matchesSearch = trip.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                            trip.destination.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      let matchesTime = true;
      const tripStart = new Date(trip.startDate);
      if (timeFilter === 'upcoming') matchesTime = tripStart >= today;
      if (timeFilter === 'past') matchesTime = tripStart < today;
      
      return matchesSearch && matchesTime;
    });

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'a-z') return a.title.localeCompare(b.title);
      if (sortBy === 'z-a') return b.title.localeCompare(a.title);
      return 0;
    });

    return result;
  }, [trips, debouncedSearch, timeFilter, sortBy]);

  return (
    <div className="page-container" style={{ padding: 'var(--space-8) var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 var(--space-2) 0', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Command Center</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Manage and organize your personal travel universe.</p>
        </div>
        
        {trips.length > 0 && (
          <Link to="/create-trip">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--color-primary-glow)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                color: 'white',
                border: 'none',
                padding: 'var(--space-3) var(--space-6)',
                borderRadius: 'var(--radius-full)',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer'
              }}
            >
              <Plus size={18} />
              New Trip
            </motion.button>
          </Link>
        )}
      </div>

      {/* Top Stats Row */}
      {trips.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', marginBottom: 'var(--space-8)' }}>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
              <Compass size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Total Trips</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total}</div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Upcoming Trips</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.upcoming}</div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-warning)' }}>
              <MapPin size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Destinations</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.countries}</div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      {trips.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-full)', padding: '4px' }}>
            <button onClick={() => setTimeFilter('all')} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', background: timeFilter === 'all' ? 'var(--color-primary)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500, transition: '0.2s' }}>All</button>
            <button onClick={() => setTimeFilter('upcoming')} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', background: timeFilter === 'upcoming' ? 'var(--color-primary)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500, transition: '0.2s' }}>Upcoming</button>
            <button onClick={() => setTimeFilter('past')} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', background: timeFilter === 'past' ? 'var(--color-primary)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500, transition: '0.2s' }}>Past</button>
          </div>

          <div style={{ display: 'flex', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', width: '250px', maxWidth: '100%' }}>
              <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search trips..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-full)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  appearance: 'none',
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  padding: '8px 32px 8px 16px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="a-z">A-Z</option>
                <option value="z-a">Z-A</option>
              </select>
              <ChevronDown size={14} color="var(--color-text-muted)" style={{ position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      )}

      {/* Trips Grid / Skeletons */}
      {isLoading ? (
        <div className="responsive-grid" style={{ gap: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
          {[1, 2, 3].map(n => (
            <div key={n} className="glass-panel" style={{ height: '300px', animation: 'pulse 1.5s infinite', background: 'rgba(255,255,255,0.02)' }} />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState 
          icon={Compass}
          title="Your adventure awaits"
          message="You haven't planned any trips yet. Create your first itinerary to start organizing flights, budgets, and daily activities."
          actionLabel="Let's Plan a Trip!"
          actionIcon={Plus}
          onAction={() => navigate('/create-trip')}
        />
      ) : filteredTrips.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="responsive-grid"
          style={{ gap: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}
        >
          <AnimatePresence>
            {filteredTrips.map((trip) => (
              <motion.div key={trip.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <TripCard trip={trip} onDelete={deleteTrip} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <EmptyState 
          icon={Search}
          title="No trips found matching your filters"
          message="Try adjusting your search criteria or time filters."
          actionLabel={(search || timeFilter !== 'all') ? "Clear Filters" : null}
          onAction={() => { setSearch(''); setTimeFilter('all'); }}
        />
      )}

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;