import { useState } from 'react';
import '../../styles/itinerary.css';

const TAGS = ['beach', 'adventure', 'culture', 'food', 'family', 'romantic', 'budget', 'luxury'];
const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'date', label: 'Newest' },
  { value: 'trending', label: 'Trending' },
];

export default function FilterSidebar({ onFilterChange, initialFilters = {} }) {
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'popularity');
  const [minBudget, setMinBudget] = useState(initialFilters.minBudget || '');
  const [maxBudget, setMaxBudget] = useState(initialFilters.maxBudget || '');
  const [selectedTags, setSelectedTags] = useState(initialFilters.tags || []);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleApply = () => {
    onFilterChange && onFilterChange({ sortBy, minBudget: minBudget || undefined, maxBudget: maxBudget || undefined, tags: selectedTags });
  };

  const handleReset = () => {
    setSortBy('popularity');
    setMinBudget('');
    setMaxBudget('');
    setSelectedTags([]);
    onFilterChange && onFilterChange({ sortBy: 'popularity', tags: [] });
  };

  return (
    <div className="filter-sidebar">
      <h3>Filters</h3>

      <div className="filter-group">
        <label>Sort By</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Budget Range (USD)</label>
        <div className="budget-range">
          <input type="number" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} placeholder="Min" min="0" />
          <span>–</span>
          <input type="number" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} placeholder="Max" min="0" />
        </div>
      </div>

      <div className="filter-group">
        <label>Tags</label>
        <div className="tag-checkboxes">
          {TAGS.map((tag) => (
            <label key={tag} className={`tag-checkbox${selectedTags.includes(tag) ? ' selected' : ''}`}>
              <input type="checkbox" checked={selectedTags.includes(tag)} onChange={() => toggleTag(tag)} />
              <span>{tag}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-actions">
        <button className="btn btn-outline btn-sm" onClick={handleReset}>Reset</button>
        <button className="btn btn-primary btn-sm" onClick={handleApply}>Apply</button>
      </div>
    </div>
  );
}
