import { useState } from 'react';
import { formatDate, getAvatarInitials } from '../../utils/itineraryHelpers.js';
import RatingsDisplay from './RatingsDisplay.jsx';
import '../../styles/itinerary.css';

export default function ReviewsList({ reviews = [] }) {
  const [shown, setShown] = useState(5);

  if (!reviews.length) {
    return <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>No reviews yet. Be the first to review!</p>;
  }

  return (
    <div>
      <div className="reviews-list">
        {reviews.slice(0, shown).map((r, idx) => {
          const reviewer = r.user || r.reviewer || {};
          const name = reviewer.username || reviewer.name || 'Anonymous';
          return (
            <div key={r._id || idx} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">{getAvatarInitials(name)}</div>
                  <div>
                    <div className="reviewer-name">{name}</div>
                    <RatingsDisplay rating={r.rating || 0} size="sm" />
                  </div>
                </div>
                <span className="review-date">{r.createdAt ? formatDate(r.createdAt) : ''}</span>
              </div>
              {r.comment && <p className="review-text">{r.comment}</p>}
            </div>
          );
        })}
      </div>
      {shown < reviews.length && (
        <div className="reviews-load-more">
          <button className="btn btn-outline btn-sm" onClick={() => setShown((p) => p + 5)}>
            Load More Reviews ({reviews.length - shown} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
