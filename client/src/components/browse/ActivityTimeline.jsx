import { MapPin, Clock } from 'lucide-react';
import { getCategoryIcon, formatBudget } from '../../utils/itineraryHelpers.js';
import '../../styles/itinerary.css';

function getTypeClass(type) {
  const t = (type || '').toLowerCase();
  if (t === 'accommodation' || t === 'hotel') return 'accommodation';
  if (t === 'transport' || t === 'flight' || t === 'train' || t === 'bus' || t === 'car') return 'transport';
  if (t === 'food' || t === 'restaurant') return 'food';
  if (t === 'activity' || t === 'sightseeing' || t === 'entertainment') return 'activity';
  return 'default';
}

export default function ActivityTimeline({ activities = [], currency = 'USD' }) {
  if (!activities.length) {
    return <p style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '0.5rem 0' }}>No activities for this day.</p>;
  }

  return (
    <div className="activity-timeline">
      {activities.map((act, idx) => {
        const typeClass = getTypeClass(act.type);
        return (
          <div key={act._id || idx} className="timeline-item">
            <div className="timeline-time">{act.startTime || ''}</div>
            <div className={`timeline-dot ${typeClass}`} />
            <div className="timeline-card">
              <div className="timeline-card-header">
                <div className="timeline-card-title">
                  {getCategoryIcon(act.type)} {act.name}
                </div>
                {act.cost > 0 && (
                  <span className="timeline-card-cost">{formatBudget(act.cost, currency)}</span>
                )}
              </div>
              <div className="timeline-card-meta">
                {act.endTime && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock size={11} /> {act.startTime && `${act.startTime} – `}{act.endTime}
                  </span>
                )}
                {act.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <MapPin size={11} /> {act.location}
                  </span>
                )}
                <span className={`timeline-type-badge type-${typeClass}`}>{act.type || 'activity'}</span>
              </div>
              {act.notes && <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem' }}>{act.notes}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
