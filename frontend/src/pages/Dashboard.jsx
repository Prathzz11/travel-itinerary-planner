import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Calendar, MapPin, Compass } from 'lucide-react';
import { useTrip } from '../hooks/useTrip';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';
import TripCard from '../components/trip/TripCard';
import EmptyState from '../components/ui/EmptyState';


const Dashboard = () => {
  const navigate = useNavigate();
  const { trips, deleteTrip } = useTrip();
  const [search, setSearch] = useLocalStorage('dashboard_search', '');
  const [timeFilter, setTimeFilter] = useLocalStorage('dashboard_timeFilter', 'all');
  const [sortBy, setSortBy] = useLocalStorage('dashboard_sortBy', 'newest');
  const [isLoading, setIsLoading] = useState(true);

  
  const debouncedSearch = useDebounce(search, 500);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => {
    if (!trips) return { total: 0, upcoming: 0, countries: 0 };
    const today = new Date();
    today.setHours(0,0,0,0);
    return {
      total: trips.length,
      upcoming: trips.filter(t => new Date(t.startDate) >= today).length,
      countries: new Set(trips.map(t => t.destination)).size
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
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h1 className="display-6 fw-bold mb-1">Control Room</h1>
          <p className="text-muted mb-0">Manage and organize your personal travel universe.</p>
        </div>
        <div className="d-flex gap-2">
          {trips.length > 0 && (
            <Link to="/create-trip" className="btn btn-primary d-flex align-items-center gap-2">
              <Plus size={18} /> New Trip
            </Link>
          )}
        </div>
      </div>

      {/* Stats Row */}
      {trips.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: 'rgba(56,189,248,0.1)', color: 'var(--color-primary)' }}>
                  <Compass size={24} />
                </div>
                <div>
                  <div className="text-muted small">Total Trips</div>
                  <div className="fs-4 fw-bold">{stats.total}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="text-muted small">Upcoming</div>
                  <div className="fs-4 fw-bold">{stats.upcoming}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="text-muted small">Destinations</div>
                  <div className="fs-4 fw-bold">{stats.countries}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {trips.length > 0 && (
        <div className="d-flex flex-wrap gap-3 mb-4 align-items-center justify-content-between">
          <div className="btn-group" role="group">
            <button className={`btn btn-sm ${timeFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTimeFilter('all')}>All</button>
            <button className={`btn btn-sm ${timeFilter === 'upcoming' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTimeFilter('upcoming')}>Upcoming</button>
            <button className={`btn btn-sm ${timeFilter === 'past' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setTimeFilter('past')}>Past</button>
          </div>

          <div className="d-flex gap-2">
            <div className="input-group input-group-sm" style={{ width: '220px' }}>
              <span className="input-group-text bg-transparent"><Search size={14} className="text-muted" /></span>
              <input type="text" className="form-control" placeholder="Search trips..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className="form-select form-select-sm" style={{ width: 'auto' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="responsive-grid g-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="card placeholder-glow" style={{ height: '300px' }}>
              <div className="card-body"><span className="placeholder col-6"></span></div>
            </div>
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
        <div className="responsive-grid stagger-children" style={{ gap: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
          {filteredTrips.map((trip) => (
            <div key={trip._id || trip.id}>
              <TripCard trip={trip} onDelete={deleteTrip} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Search}
          title="No trips found matching your filters"
          message="Try adjusting your search criteria or time filters."
          actionLabel={(search || timeFilter !== 'all') ? "Clear Filters" : null}
          onAction={() => { setSearch(''); setTimeFilter('all'); }}
        />
      )}

    </div>
  );
};

export default Dashboard;