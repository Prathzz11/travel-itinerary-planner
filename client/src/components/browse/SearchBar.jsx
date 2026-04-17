import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import '../../styles/itinerary.css';

export default function SearchBar({ initialValue = '', onSearch, placeholder = 'Search destinations, trips...' }) {
  const [value, setValue] = useState(initialValue);
  const timerRef = useRef(null);

  const debouncedSearch = useCallback((q) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch && onSearch(q);
    }, 300);
  }, [onSearch]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleChange = (e) => {
    const q = e.target.value;
    setValue(q);
    debouncedSearch(q);
  };

  const handleClear = () => {
    setValue('');
    onSearch && onSearch('');
  };

  return (
    <div className="search-bar">
      <Search size={18} className="search-icon" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
      {value && (
        <button className="clear-btn" onClick={handleClear} type="button" aria-label="Clear search">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
