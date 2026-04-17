import { Hotel, Plane, Train, Car, Bus, MapPin } from 'lucide-react';
import { formatDate } from '../../utils/itineraryHelpers.js';
import '../../styles/itinerary.css';

function getAccommodationIcon(type) {
  const t = (type || '').toLowerCase();
  if (t === 'flight' || t === 'plane') return <Plane size={18} />;
  if (t === 'train') return <Train size={18} />;
  if (t === 'car' || t === 'drive') return <Car size={18} />;
  if (t === 'bus') return <Bus size={18} />;
  return <Hotel size={18} />;
}

function isAccommodationOrTransport(type) {
  const t = (type || '').toLowerCase();
  return ['accommodation', 'hotel', 'transport', 'flight', 'train', 'car', 'bus', 'plane'].includes(t);
}

export default function AccommodationSection({ days = [], currency = 'USD' }) {
  const items = [];
  days.forEach((day) => {
    (day.activities || []).forEach((act) => {
      if (isAccommodationOrTransport(act.type)) {
        items.push({ ...act, dayNumber: day.dayNumber, date: day.date });
      }
    });
  });

  if (!items.length) {
    return <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>No accommodation or transport found.</p>;
  }

  return (
    <div className="accommodation-grid">
      {items.map((item, idx) => (
        <div key={item._id || idx} className="accommodation-card">
          <div className="accommodation-icon">{getAccommodationIcon(item.type)}</div>
          <div className="accommodation-info">
            <h4>{item.name}</h4>
            {item.location && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginBottom: '0.2rem' }}>
                <MapPin size={12} /> {item.location}
              </p>
            )}
            {item.date && <p>{formatDate(item.date)}</p>}
            <span className="accommodation-badge">{item.type}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
