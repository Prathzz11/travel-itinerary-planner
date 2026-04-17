import { Star } from 'lucide-react';
import { formatRating } from '../../utils/itineraryHelpers.js';
import '../../styles/itinerary.css';

export default function RatingsDisplay({ rating = 0, reviewCount = 0, size = 'sm' }) {
  const filled = Math.floor(rating);
  const hasHalf = rating - filled >= 0.5;
  const empty = 5 - filled - (hasHalf ? 1 : 0);
  const starSize = size === 'lg' ? 18 : 14;

  return (
    <span className={`rating-stars ${size}`}>
      {Array.from({ length: filled }).map((_, i) => (
        <Star key={`f${i}`} size={starSize} className="star" fill="#f59e0b" color="#f59e0b" />
      ))}
      {hasHalf && (
        <span style={{ position: 'relative', display: 'inline-flex' }}>
          <Star size={starSize} color="#e2e8f0" fill="#e2e8f0" />
          <span style={{ position: 'absolute', inset: 0, overflow: 'hidden', width: '50%' }}>
            <Star size={starSize} color="#f59e0b" fill="#f59e0b" />
          </span>
        </span>
      )}
      {Array.from({ length: Math.max(0, empty) }).map((_, i) => (
        <Star key={`e${i}`} size={starSize} className="star empty" color="#e2e8f0" fill="#e2e8f0" />
      ))}
      <span className="rating-value">{formatRating(rating)}</span>
      {reviewCount > 0 && <span className="rating-count">({reviewCount})</span>}
    </span>
  );
}
