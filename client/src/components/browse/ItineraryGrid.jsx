import ItineraryCard from './ItineraryCard.jsx';
import '../../styles/itinerary.css';

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-thumb" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line" style={{ width: '80%' }} />
        <div className="skeleton skeleton-line w-1-2" />
        <div className="skeleton skeleton-line w-3-4" />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div className="skeleton skeleton-line w-1-4" />
          <div className="skeleton skeleton-line w-1-4" />
        </div>
      </div>
    </div>
  );
}

export default function ItineraryGrid({ itineraries = [], loading = false, onPreview }) {
  if (loading) {
    return (
      <div className="itinerary-grid">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!itineraries.length) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔍</div>
        <h3 style={{ marginBottom: '0.4rem' }}>No itineraries found</h3>
        <p style={{ fontSize: '0.9rem' }}>Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="itinerary-grid">
      {itineraries.map((item) => (
        <ItineraryCard key={item._id} itinerary={item} onPreview={onPreview} />
      ))}
    </div>
  );
}
