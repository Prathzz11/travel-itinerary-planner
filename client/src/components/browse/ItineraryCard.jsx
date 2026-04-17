import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, GitFork, Star, Eye, Clock } from 'lucide-react';
import { formatBudget, formatDate, formatDuration, getAvatarInitials, truncateText, formatRating } from '../../utils/itineraryHelpers.js';
import '../../styles/itinerary.css';

const GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
];

export default function ItineraryCard({ itinerary, onPreview }) {
  const navigate = useNavigate();
  const gradIdx = itinerary._id ? parseInt(itinerary._id.slice(-1), 16) % GRADIENTS.length : 0;

  const handleClick = (e) => {
    if (e.target.closest('button')) return;
    navigate(`/itineraries/${itinerary._id}`);
  };

  const handleFork = (e) => {
    e.stopPropagation();
    navigate(`/fork/${itinerary._id}`);
  };

  const handlePreview = (e) => {
    e.stopPropagation();
    onPreview && onPreview(itinerary);
  };

  const creator = itinerary.owner || itinerary.creator || {};
  const creatorName = creator.username || creator.name || 'Unknown';
  const tags = itinerary.tags || [];

  return (
    <div className="itinerary-card" onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleClick(e)}>
      <div className="card-thumbnail" style={{ background: itinerary.thumbnail ? undefined : GRADIENTS[gradIdx] }}>
        {itinerary.thumbnail ? (
          <img src={itinerary.thumbnail} alt={itinerary.name} loading="lazy" />
        ) : (
          <div className="thumbnail-placeholder">🗺️</div>
        )}
        {tags.length > 0 && (
          <div className="thumbnail-tags">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="thumbnail-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div className="card-info">
        <div className="card-title" title={itinerary.name}>{truncateText(itinerary.name, 48)}</div>
        {itinerary.destination && (
          <div className="card-destination">
            <MapPin size={13} />
            <span>{itinerary.destination}</span>
          </div>
        )}
        <div className="card-meta">
          <div className="creator-avatar">{getAvatarInitials(creatorName)}</div>
          <span className="creator-name">{creatorName}</span>
          {(itinerary.startDate && itinerary.endDate) && (
            <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Calendar size={11} />
              {formatDuration(itinerary.startDate, itinerary.endDate)}
            </span>
          )}
        </div>

        <div className="card-stats">
          <span className="stat-item">
            <Star size={12} style={{ color: '#f59e0b' }} />
            <span>{formatRating(itinerary.averageRating)} ({itinerary.reviewCount || 0})</span>
          </span>
          <span className="stat-item">
            <GitFork size={12} />
            <span>{itinerary.forkCount || 0} forks</span>
          </span>
          {itinerary.totalBudget > 0 && (
            <span className="card-budget">
              <DollarSign size={12} />
              {formatBudget(itinerary.totalBudget, itinerary.currency)}
            </span>
          )}
        </div>
      </div>

      <div className="card-actions">
        <button className="btn btn-ghost btn-sm" onClick={handlePreview}>
          <Eye size={13} /> Preview
        </button>
        <button className="btn btn-primary btn-sm" onClick={handleFork}>
          <GitFork size={13} /> Fork
        </button>
      </div>
    </div>
  );
}
