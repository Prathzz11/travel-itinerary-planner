import { useEffect, useState } from 'react';
import { getRelatedItineraries } from '../../services/itineraryService.js';
import ItineraryCard from './ItineraryCard.jsx';
import '../../styles/itinerary.css';

export default function RelatedItineraries({ id, onPreview }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRelatedItineraries(id)
      .then((res) => setRelated(res.data?.itineraries || res.data || []))
      .catch(() => setRelated([]))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="related-section">
        <h3>Explore More Like This</h3>
        <div className="related-scroll">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-card" style={{ minWidth: '270px', flexShrink: 0 }}>
              <div className="skeleton skeleton-thumb" />
              <div className="skeleton-body">
                <div className="skeleton skeleton-line" style={{ width: '80%' }} />
                <div className="skeleton skeleton-line w-1-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!related.length) return null;

  return (
    <div className="related-section">
      <h3>Explore More Like This</h3>
      <div className="related-scroll">
        {related.map((item) => (
          <ItineraryCard key={item._id} itinerary={item} onPreview={onPreview} />
        ))}
      </div>
    </div>
  );
}
