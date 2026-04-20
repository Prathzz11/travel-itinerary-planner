import React, { useState, useContext, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Copy, MapPin, DollarSign, Clock, Filter, ChevronDown, ChevronUp, Activity, X } from 'lucide-react';
import { ExploreContext } from '../contexts/ExploreContext';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';
import EmptyState from '../components/ui/EmptyState';

const BrowseItineraries = () => {
  const { publicTrips } = useContext(ExploreContext);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setIsLoading(false), 1000); return () => clearTimeout(t); }, []);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [destinationSearch, setDestinationSearch] = useState('');
  const debouncedDestination = useDebounce(destinationSearch, 500);
  const maxTripBudget = useMemo(() => Math.max(...publicTrips.map(t => t.budget || 0), 1000), [publicTrips]);
  const [savedFilters, setSavedFilters] = useLocalStorage('explore_filters', { budgetLimit: 1000, minRating: 0, difficultyFilter: 'All', durationFilter: 'All' });
  const [budgetLimit, setBudgetLimit] = useState(savedFilters.budgetLimit || maxTripBudget);
  const debouncedBudgetLimit = useDebounce(budgetLimit, 500);
  const [minRating, setMinRating] = useState(savedFilters.minRating || 0);
  const [difficultyFilter, setDifficultyFilter] = useState(savedFilters.difficultyFilter || 'All');
  const [durationFilter, setDurationFilter] = useState(savedFilters.durationFilter || 'All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useLocalStorage('explore_sortBy', 'trending');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { setSavedFilters({ budgetLimit, minRating, difficultyFilter, durationFilter }); }, [budgetLimit, minRating, difficultyFilter, durationFilter, setSavedFilters]);

  const activeFilterCount = useMemo(() => { let c = 0; if (debouncedSearch) c++; if (debouncedDestination) c++; if (debouncedBudgetLimit < maxTripBudget) c++; if (minRating > 0) c++; if (difficultyFilter !== 'All') c++; if (durationFilter !== 'All') c++; if (startDate || endDate) c++; return c; }, [debouncedSearch, debouncedDestination, debouncedBudgetLimit, maxTripBudget, minRating, difficultyFilter, durationFilter, startDate, endDate]);
  const resetFilters = () => { setSearch(''); setDestinationSearch(''); setBudgetLimit(maxTripBudget); setMinRating(0); setDifficultyFilter('All'); setDurationFilter('All'); setStartDate(''); setEndDate(''); setSortBy('trending'); };
  const uniqueDestinations = useMemo(() => Array.from(new Set(publicTrips.map(t => t.destination))).sort(), [publicTrips]);
  const [displayedCount, setDisplayedCount] = useState(12);
  const observerTarget = useRef(null);

  const filteredAndSortedTrips = useMemo(() => {
    let result = [...publicTrips];
    if (debouncedSearch) { const q = debouncedSearch.toLowerCase(); result = result.filter(t => t.title.toLowerCase().includes(q) || t.tags?.some(tag => tag.toLowerCase().includes(q))); }
    if (debouncedDestination) result = result.filter(t => t.destination.toLowerCase().includes(debouncedDestination.toLowerCase()));
    result = result.filter(t => (t.budget || 0) <= debouncedBudgetLimit);
    if (minRating > 0) result = result.filter(t => (t.rating || 0) >= minRating);
    if (difficultyFilter !== 'All') result = result.filter(t => t.difficulty === difficultyFilter);
    if (durationFilter !== 'All') { if (durationFilter === 'Weekend (1-3 days)') result = result.filter(t => t.durationDays <= 3); else if (durationFilter === '1 Week') result = result.filter(t => t.durationDays > 3 && t.durationDays <= 7); else if (durationFilter === '2+ Weeks') result = result.filter(t => t.durationDays > 7); }
    if (startDate) result = result.filter(t => new Date(t.createdAt) >= new Date(startDate));
    if (endDate) result = result.filter(t => new Date(t.createdAt) <= new Date(endDate));
    result.sort((a, b) => { if (sortBy === 'trending') return b.trendingScore - a.trendingScore; if (sortBy === 'popular') return b.forks - a.forks; if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0); if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt); return 0; });
    return result;
  }, [publicTrips, debouncedSearch, debouncedDestination, debouncedBudgetLimit, minRating, difficultyFilter, durationFilter, startDate, endDate, sortBy]);

  const handleObserver = useCallback((entries) => { if (entries[0].isIntersecting) setDisplayedCount(prev => Math.min(prev + 8, filteredAndSortedTrips.length)); }, [filteredAndSortedTrips.length]);
  useEffect(() => { const observer = new IntersectionObserver(handleObserver, { rootMargin: '200px' }); if (observerTarget.current) observer.observe(observerTarget.current); return () => observer.disconnect(); }, [handleObserver]);
  useEffect(() => { setDisplayedCount(12); }, [debouncedSearch, debouncedDestination, debouncedBudgetLimit, minRating, difficultyFilter, durationFilter, startDate, endDate, sortBy]);
  const displayedTrips = filteredAndSortedTrips.slice(0, displayedCount);

  return (
    <div className="page-container animate-fade-in">
      <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
        <div><h1 className="display-6 fw-bold mb-1">Explore Itineraries</h1><p className="text-muted mb-0">Discover, fork, and customize community trips.</p></div>
        <select className="form-select" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="trending">🔥 Trending</option><option value="popular">🔄 Most Forked</option><option value="rating">⭐ Highest Rated</option><option value="newest">✨ Newest</option>
        </select>
      </div>

      {/* Search & Filters */}
      <div className="card mb-4"><div className="card-body">
        <div className="d-flex gap-3 flex-wrap mb-3">
          <div className="flex-grow-1" style={{ minWidth: 200 }}><input type="text" className="form-control" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or tags..." /></div>
          <div className="flex-grow-1" style={{ minWidth: 200 }}><input type="text" className="form-control" value={destinationSearch} onChange={e => setDestinationSearch(e.target.value)} list="dest-list" placeholder="Search destination..." /><datalist id="dest-list">{uniqueDestinations.map(d => <option key={d} value={d} />)}</datalist></div>
          <button className={`btn ${showFilters || activeFilterCount > 0 ? 'btn-primary' : 'btn-outline-secondary'} d-flex align-items-center gap-1`} onClick={() => setShowFilters(!showFilters)}><Filter size={16} /> Filters{activeFilterCount > 0 && ` (${activeFilterCount})`} {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
          {activeFilterCount > 0 && <button className="btn btn-outline-secondary d-flex align-items-center gap-1" onClick={resetFilters}><X size={14} /> Reset</button>}
        </div>

        {showFilters && (
          <div className="row g-3 pt-3 border-top animate-fade-in">
            <div className="col-md-3"><label className="form-label text-muted small">Max Budget: ${budgetLimit}</label><input type="range" className="form-range" min="0" max={maxTripBudget} step="100" value={budgetLimit} onChange={e => setBudgetLimit(Number(e.target.value))} /></div>
            <div className="col-md-3"><label className="form-label text-muted small">Min Rating</label><select className="form-select form-select-sm" value={minRating} onChange={e => setMinRating(Number(e.target.value))}><option value="0">Any</option><option value="4">4+</option><option value="4.5">4.5+</option><option value="5">5</option></select></div>
            <div className="col-md-3"><label className="form-label text-muted small">Difficulty</label><select className="form-select form-select-sm" value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)}><option value="All">Any</option><option value="Easy">Easy</option><option value="Moderate">Moderate</option><option value="Hard">Hard</option></select></div>
            <div className="col-md-3"><label className="form-label text-muted small">Duration</label><select className="form-select form-select-sm" value={durationFilter} onChange={e => setDurationFilter(e.target.value)}><option value="All">Any</option><option value="Weekend (1-3 days)">Weekend</option><option value="1 Week">1 Week</option><option value="2+ Weeks">2+ Weeks</option></select></div>
            <div className="col-md-6"><label className="form-label text-muted small">Created After</label><input type="date" className="form-control form-control-sm" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ colorScheme: 'dark' }} /></div>
            <div className="col-md-6"><label className="form-label text-muted small">Created Before</label><input type="date" className="form-control form-control-sm" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ colorScheme: 'dark' }} /></div>
          </div>
        )}
      </div></div>

      {/* Grid */}
      {isLoading ? (
        <div className="row g-4">{[1,2,3,4,5,6].map(i => <div key={i} className="col-md-6 col-lg-4"><div className="card" style={{ height: 360 }}><div className="card-body d-flex flex-column gap-3"><div className="placeholder-glow"><span className="placeholder w-100 rounded" style={{ height: 180 }}></span><span className="placeholder w-75 rounded mt-3" style={{ height: 24 }}></span><span className="placeholder w-50 rounded" style={{ height: 16 }}></span></div></div></div></div>)}</div>
      ) : filteredAndSortedTrips.length > 0 ? (
        <div className="row g-4">
          {displayedTrips.map(item => (
            <div key={item.id} className="col-md-6 col-lg-4">
              <div className="card h-100 hover-lift">
                <div className="position-relative" style={{ height: 200 }}>
                  <img src={item.image} alt={item.title} loading="lazy" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  <span className="badge position-absolute top-0 end-0 m-2 d-flex align-items-center gap-1" style={{ background: 'rgba(0,0,0,0.6)' }}><Star size={12} color="#fbbf24" fill="#fbbf24" /> {item.rating}</span>
                </div>
                <div className="card-body d-flex flex-column">
                  <h6 className="fw-bold mb-1">{item.title}</h6>
                  <div className="text-muted small d-flex align-items-center gap-1 mb-3"><MapPin size={12} /> {item.destination}</div>
                  <div className="row g-1 mb-3 small">
                    <div className="col-6 d-flex align-items-center gap-1"><Clock size={13} color="var(--color-secondary)" /> {item.durationDays} Days</div>
                    <div className="col-6 d-flex align-items-center gap-1"><DollarSign size={13} color="var(--color-success)" /> {item.budget} {item.currency}</div>
                    <div className="col-6 d-flex align-items-center gap-1"><Activity size={13} color="var(--color-accent)" /> {item.difficulty}</div>
                    <div className="col-6 d-flex align-items-center gap-1"><Copy size={13} color="var(--color-primary)" /> {item.forks} Forks</div>
                  </div>
                  <div className="d-flex flex-wrap gap-1 mb-3">{item.tags?.slice(0, 3).map(tag => <span key={tag} className="badge bg-secondary bg-opacity-25 small">{tag}</span>)}{item.tags?.length > 3 && <span className="text-muted small">+{item.tags.length - 3}</span>}</div>
                  <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <Link to={`/user/${item.author.id}`} className="d-flex align-items-center gap-2 text-decoration-none text-white"><img src={item.author.avatar} alt={item.author.name} className="rounded-circle" style={{ width: 24, height: 24 }} /><span className="small">{item.author.name}</span></Link>
                    <Link to={`/itinerary/${item.id}`} className="btn btn-primary btn-sm">View</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyState icon={Search} title="No itineraries found" message="No public itineraries match your search or filters." actionLabel="Reset Filters" onAction={resetFilters} />}

      {displayedCount < filteredAndSortedTrips.length && <div ref={observerTarget} className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></div>}
    </div>
  );
};

export default BrowseItineraries;