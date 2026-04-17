import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, MapPin, Calendar, DollarSign, GitFork, Eye } from 'lucide-react';
import { formatDate, formatBudget, formatDuration, getAvatarInitials, getCategoryIcon } from '../../utils/itineraryHelpers.js';
import RatingsDisplay from './RatingsDisplay.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import '../../styles/itinerary.css';

export default function ItineraryPreview({ itinerary, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!itinerary) return null;

  const creator = itinerary.createdBy || itinerary.createdBy || {};
  const creatorName = creator.username || creator.name || 'Unknown';
  const days = itinerary.days || [];

  const handleFork = () => {
    onClose();
    if (!user) { navigate('/login'); return; }
    navigate(`/fork/${itinerary._id}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{itinerary.name}</h2>
            {itinerary.destination && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#64748b' }}>
                <MapPin size={13} />{itinerary.destination}
              </div>
            )}
          </div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div className="creator-avatar">{getAvatarInitials(creatorName)}</div>
              {creatorName}
            </span>
            {itinerary.startDate && itinerary.endDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={13} /> {formatDate(itinerary.startDate)} – {formatDate(itinerary.endDate)} · {formatDuration(itinerary.startDate, itinerary.endDate)}
              </span>
            )}
            {itinerary.budget?.total > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 600 }}>
                <DollarSign size={13} /> {formatBudget(itinerary.budget?.total, itinerary.budget?.currency)}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <GitFork size={13} /> {itinerary.forkCount || 0} forks
            </span>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <RatingsDisplay rating={itinerary.averageRating || 0} reviewCount={itinerary.reviewCount || 0} size="sm" />
          </div>

          {days.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.6rem', color: '#1e293b' }}>Itinerary Overview</h4>
              {days.slice(0, 4).map((day, di) => (
                <div key={day._id || di} className="preview-day">
                  <div className="preview-day-title">Day {day.dayNumber || di + 1}{day.date ? ` · ${formatDate(day.date)}` : ''}</div>
                  {(day.activities || []).slice(0, 3).map((act, ai) => (
                    <div key={act._id || ai} className="preview-activity">
                      <span className="preview-activity-icon">{getCategoryIcon(act.type)}</span>
                      <span className="preview-activity-name">{act.name}</span>
                      {act.cost > 0 && <span className="preview-activity-cost">{formatBudget(act.cost)}</span>}
                    </div>
                  ))}
                  {(day.activities || []).length > 3 && (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', paddingLeft: '1.5rem' }}>+{day.activities.length - 3} more activities</div>
                  )}
                </div>
              ))}
              {days.length > 4 && (
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.5rem' }}>+{days.length - 4} more days</div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Link to={`/itineraries/${itinerary._id}`} className="btn btn-outline btn-sm" onClick={onClose}>
            <Eye size={14} /> View Full
          </Link>
          <button className="btn btn-primary btn-sm" onClick={handleFork}>
            <GitFork size={14} /> Fork This Trip
          </button>
        </div>
      </div>
    </div>
  );
}
