import React, { useState, useContext, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Star, Copy, MapPin, DollarSign, Clock, Filter, ChevronDown, ChevronUp, Activity, TrendingUp, X } from 'lucide-react';
import { ExploreContext } from '../contexts/ExploreContext';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';
import EmptyState from '../components/ui/EmptyState';

const BrowseItineraries = () => {
  const { publicTrips } = useContext(ExploreContext);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading delay for demonstration of loading states
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filtering and Sorting State
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  
  const [destinationSearch, setDestinationSearch] = useState('');
  const debouncedDestination = useDebounce(destinationSearch, 500);
  
  // Get max budget dynamically
  const maxTripBudget = useMemo(() => Math.max(...publicTrips.map(t => t.budget || 0), 1000), [publicTrips]);
  
  const [savedFilters, setSavedFilters] = useLocalStorage('explore_filters', {
    budgetLimit: 1000,
    minRating: 0,
    difficultyFilter: 'All',
    durationFilter: 'All'
  });

  const [budgetLimit, setBudgetLimit] = useState(savedFilters.budgetLimit || maxTripBudget);
  const debouncedBudgetLimit = useDebounce(budgetLimit, 500);

  const [minRating, setMinRating] = useState(savedFilters.minRating || 0);
  const [difficultyFilter, setDifficultyFilter] = useState(savedFilters.difficultyFilter || 'All');
  const [durationFilter, setDurationFilter] = useState(savedFilters.durationFilter || 'All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useLocalStorage('explore_sortBy', 'trending'); // trending, popular, rating, newest
  const [showFilters, setShowFilters] = useState(false);

  // Sync state back to local storage when filters change
  useEffect(() => {
    setSavedFilters({
      budgetLimit, minRating, difficultyFilter, durationFilter
    });
  }, [budgetLimit, minRating, difficultyFilter, durationFilter, setSavedFilters]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (debouncedSearch) count++;
    if (debouncedDestination) count++;
    if (debouncedBudgetLimit < maxTripBudget) count++;
    if (minRating > 0) count++;
    if (difficultyFilter !== 'All') count++;
    if (durationFilter !== 'All') count++;
    if (startDate || endDate) count++;
    return count;
  }, [debouncedSearch, debouncedDestination, debouncedBudgetLimit, maxTripBudget, minRating, difficultyFilter, durationFilter, startDate, endDate]);

  const resetFilters = () => {
    setSearch('');
    setDestinationSearch('');
    setBudgetLimit(maxTripBudget);
    setMinRating(0);
    setDifficultyFilter('All');
    setDurationFilter('All');
    setStartDate('');
    setEndDate('');
    setSortBy('trending');
  };

  // Extract unique destinations for autocomplete
  const uniqueDestinations = useMemo(() => {
    const dests = new Set(publicTrips.map(t => t.destination));
    return Array.from(dests).sort();
  }, [publicTrips]);

  // Pagination / Infinite Scroll State
  const [displayedCount, setDisplayedCount] = useState(12);
  const observerTarget = useRef(null);

  // Apply filters and sorting
  const filteredAndSortedTrips = useMemo(() => {
    let result = [...publicTrips];

    // 1. Keyword Search Filter
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // 2. Destination Search Filter
    if (debouncedDestination) {
      const dq = debouncedDestination.toLowerCase();
      result = result.filter(t => t.destination.toLowerCase().includes(dq));
    }

    // 3. Budget Filter (Slider)
    result = result.filter(t => (t.budget || 0) <= debouncedBudgetLimit);

    // 4. Rating Filter
    if (minRating > 0) {
      // get actual rating if available (from ExploreContext later if integrated, or fallback to mock)
      result = result.filter(t => (t.rating || 0) >= minRating);
    }

    // 5. Difficulty Filter
    if (difficultyFilter !== 'All') {
      result = result.filter(t => t.difficulty === difficultyFilter);
    }

    // 6. Duration Filter
    if (durationFilter !== 'All') {
      if (durationFilter === 'Weekend (1-3 days)') result = result.filter(t => t.durationDays <= 3);
      else if (durationFilter === '1 Week') result = result.filter(t => t.durationDays > 3 && t.durationDays <= 7);
      else if (durationFilter === '2+ Weeks') result = result.filter(t => t.durationDays > 7);
    }

    // 7. Date Range (filtering by created date for public templates)
    if (startDate) {
      result = result.filter(t => new Date(t.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      result = result.filter(t => new Date(t.createdAt) <= new Date(endDate));
    }

    // 8. Sorting
    result.sort((a, b) => {
      if (sortBy === 'trending') return b.trendingScore - a.trendingScore;
      if (sortBy === 'popular') return b.forks - a.forks;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

    return result;
  }, [publicTrips, debouncedSearch, debouncedDestination, debouncedBudgetLimit, minRating, difficultyFilter, durationFilter, startDate, endDate, sortBy]);

  // Infinite Scroll Observer
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting) {
      setDisplayedCount(prev => Math.min(prev + 8, filteredAndSortedTrips.length));
    }
  }, [filteredAndSortedTrips.length]);

  useEffect(() => {
    const option = { root: null, rootMargin: '200px', threshold: 0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayedCount(12);
  }, [debouncedSearch, debouncedDestination, debouncedBudgetLimit, minRating, difficultyFilter, durationFilter, startDate, endDate, sortBy]);

  const displayedTrips = filteredAndSortedTrips.slice(0, displayedCount);

  return (
    <div className="page-container" style={{ padding: 'var(--space-8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 var(--space-2) 0' }}>Explore Itineraries</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Discover, fork, and customize trips curated by the community.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '10px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white', outline: 'none', cursor: 'pointer' }}>
            <option value="trending">🔥 Trending</option>
            <option value="popular">🔄 Most Forked</option>
            <option value="rating">⭐ Highest Rated</option>
            <option value="newest">✨ Newest</option>
          </select>
        </div>
      </div>

      {/* Advanced Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
            <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by trip name or tags..." 
              style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', outline: 'none' }} 
            />
          </div>

          <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
            <MapPin style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
            <input 
              type="text" 
              value={destinationSearch}
              onChange={(e) => setDestinationSearch(e.target.value)}
              list="destination-list"
              placeholder="Search destination..." 
              style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', outline: 'none' }} 
            />
            <datalist id="destination-list">
              {uniqueDestinations.map(dest => <option key={dest} value={dest} />)}
            </datalist>
          </div>

          <button onClick={() => setShowFilters(!showFilters)} style={{ padding: '0 24px', background: showFilters || activeFilterCount > 0 ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', fontWeight: activeFilterCount > 0 ? 'bold' : 'normal' }}>
            <Filter size={18} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`} {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {activeFilterCount > 0 && (
            <button onClick={resetFilters} style={{ padding: '0 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <X size={16} /> Reset
            </button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                
                {/* Budget Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Max Budget</label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>${budgetLimit}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={maxTripBudget} 
                    step="100"
                    value={budgetLimit} 
                    onChange={e => setBudgetLimit(Number(e.target.value))} 
                    style={{ width: '100%', accentColor: 'var(--color-primary)' }} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    <span>$0</span>
                    <span>${maxTripBudget}</span>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Minimum Rating</label>
                  <select value={minRating} onChange={e => setMinRating(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }}>
                    <option value="0">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Difficulty</label>
                  <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }}>
                    <option value="All">Any Difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Duration</label>
                  <select value={durationFilter} onChange={e => setDurationFilter(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }}>
                    <option value="All">Any Duration</option>
                    <option value="Weekend (1-3 days)">Weekend (1-3 days)</option>
                    <option value="1 Week">1 Week</option>
                    <option value="2+ Weeks">2+ Weeks</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Created After</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', colorScheme: 'dark' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Created Before</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', colorScheme: 'dark' }} />
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Gallery Grid */}
      {isLoading ? (
        <div className="responsive-grid" style={{ gap: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-panel" style={{ height: '360px', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '180px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: '24px', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '12px', animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: '16px', width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '24px', animation: 'pulse 1.5s infinite' }} />
              <div style={{ marginTop: 'auto', height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', animation: 'pulse 1.5s infinite' }} />
            </div>
          ))}
        </div>
      ) : filteredAndSortedTrips.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="responsive-grid"
          style={{ gap: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}
        >
          <AnimatePresence>
          {displayedTrips.map((item, index) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={item.id} 
              className="glass-panel" 
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit' }}
            >
              {/* Lazy Loaded Image */}
              <div style={{ position: 'relative', height: '200px' }}>
                <img 
                  src={item.image} 
                  alt={item.title} 
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Star size={12} color="#fbbf24" fill="#fbbf24" /> {item.rating}
                </div>
              </div>

              <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', lineHeight: 1.2 }}>{item.title}</h3>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  <MapPin size={12} /> {item.destination}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} color="var(--color-secondary)" /> {item.durationDays} Days</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} color="var(--color-success)" /> {item.budget} {item.currency}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={14} color="var(--color-accent)" /> {item.difficulty}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Copy size={14} color="var(--color-primary)" /> {item.forks} Forks</span>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {item.tags?.slice(0,3).map(tag => (
                    <span key={tag} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{tag}</span>
                  ))}
                  {item.tags?.length > 3 && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>+{item.tags.length - 3}</span>}
                </div>

                {/* Author & Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Link to={`/user/${item.author.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white' }}>
                    <img src={item.author.avatar} alt={item.author.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.85rem' }}>{item.author.name}</span>
                  </Link>
                  <Link to={`/itinerary/${item.id}`} style={{ background: 'var(--color-primary)', color: 'white', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', transition: '0.2s', ':hover': { opacity: 0.9 } }}>
                    View
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        </motion.div>

      ) : (
        <EmptyState 
          icon={Search}
          title="No itineraries found"
          message="We couldn't find any public itineraries matching your search or filters."
          actionLabel="Reset Filters"
          onAction={resetFilters}
        />
      )}

      {/* Infinite Scroll Trigger */}
      {displayedCount < filteredAndSortedTrips.length && (
        <div ref={observerTarget} style={{ height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem' }}>
          <div style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      )}
      
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default BrowseItineraries;