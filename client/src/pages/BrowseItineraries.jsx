import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { getPublicItineraries } from '../services/itineraryService.js';
import SearchBar from '../components/browse/SearchBar.jsx';
import FilterSidebar from '../components/browse/FilterSidebar.jsx';
import ItineraryGrid from '../components/browse/ItineraryGrid.jsx';
import ItineraryPreview from '../components/browse/ItineraryPreview.jsx';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'date', label: 'Newest' },
  { value: 'trending', label: 'Trending' },
];

export default function BrowseItineraries() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [previewItem, setPreviewItem] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  const page = Number(searchParams.get('page') || 1);
  const search = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'popularity';
  const limit = 9;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        ...(search && { search }),
        sort: sortBy,
      };
      const minBudget = searchParams.get('minBudget');
      const maxBudget = searchParams.get('maxBudget');
      const tags = searchParams.get('tags');
      if (minBudget) params.minBudget = minBudget;
      if (maxBudget) params.maxBudget = maxBudget;
      if (tags) params.tags = tags;

      const res = await getPublicItineraries(params);
      const data = res.data;
      setItineraries(data.itineraries || data.data || data || []);
      setTotal(data.total || data.count || 0);
    } catch (err) {
      setError('Failed to load itineraries. Please try again.');
      setItineraries([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, searchParams]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) next.set(k, String(v));
      else next.delete(k);
    });
    setSearchParams(next);
  };

  const handleSearch = (q) => updateParams({ q, page: 1 });
  const handleSort = (s) => updateParams({ sort: s, page: 1 });
  const handleFilter = (f) => {
    updateParams({
      sort: f.sortBy,
      minBudget: f.minBudget,
      maxBudget: f.maxBudget,
      tags: f.tags?.length ? f.tags.join(',') : undefined,
      page: 1,
    });
    setShowFilter(false);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      {/* Hero */}
      <div className="browse-header">
        <div className="container">
          <h1>Discover Amazing Itineraries</h1>
          <p>Find inspiration from thousands of community-created trips</p>
          <SearchBar initialValue={search} onSearch={handleSearch} />
        </div>
      </div>

      <div className="container">
        {/* Mobile filter toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0 0', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {SORT_OPTIONS.map((o) => (
              <button key={o.value} className={`sort-btn${sortBy === o.value ? ' active' : ''}`} onClick={() => handleSort(o.value)}>{o.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {total > 0 && <span style={{ color: '#64748b', fontSize: '0.88rem' }}>{total} result{total !== 1 ? 's' : ''}</span>}
            <button className="btn btn-ghost btn-sm" style={{ display: 'flex' }} onClick={() => setShowFilter((p) => !p)}>
              <SlidersHorizontal size={15} /> Filters {showFilter ? <X size={13} /> : null}
            </button>
          </div>
        </div>

        <div className="browse-layout">
          {/* Sidebar — always rendered, visibility controlled by CSS + showFilter state */}
          <div style={{ display: showFilter ? 'block' : undefined }}>
            <FilterSidebar
              onFilterChange={handleFilter}
              initialFilters={{
                sortBy,
                minBudget: searchParams.get('minBudget') || '',
                maxBudget: searchParams.get('maxBudget') || '',
                tags: searchParams.get('tags') ? searchParams.get('tags').split(',') : [],
              }}
            />
          </div>

          {/* Grid */}
          <div>
            {error && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}
            <ItineraryGrid itineraries={itineraries} loading={loading} onPreview={setPreviewItem} />

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page === 1} onClick={() => updateParams({ page: page - 1 })}>‹</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p;
                  if (totalPages <= 7) p = i + 1;
                  else if (page <= 4) p = i + 1;
                  else if (page >= totalPages - 3) p = totalPages - 6 + i;
                  else p = page - 3 + i;
                  return (
                    <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => updateParams({ page: p })}>{p}</button>
                  );
                })}
                <button className="page-btn" disabled={page === totalPages} onClick={() => updateParams({ page: page + 1 })}>›</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {previewItem && <ItineraryPreview itinerary={previewItem} onClose={() => setPreviewItem(null)} />}
    </div>
  );
}
