import { Link } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { formatDate, formatBudget } from '../utils/itineraryHelpers.js';
import CollabAvatars from './CollabAvatars.jsx';

export default function TripCard({ trip, onEdit, onDelete, currentUserId }) {
  const isOwner = trip.createdBy === currentUserId || trip.createdBy?._id === currentUserId;

  return (
    <div className="trip-card card">
      <Link to={`/trips/${trip._id}`} className="trip-card-body card-body" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <div className="trip-card-header">
          <h3 className="trip-card-title">{trip.title}</h3>
          {trip.isPublic && <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Public</span>}
        </div>
        {trip.destination && (
          <div className="trip-meta-row">
            <MapPin size={14} className="icon-muted" />
            <span>{trip.destination}</span>
          </div>
        )}
        {(trip.startDate || trip.endDate) && (
          <div className="trip-meta-row">
            <Calendar size={14} className="icon-muted" />
            <span>
              {trip.startDate ? formatDate(trip.startDate) : '?'} – {trip.endDate ? formatDate(trip.endDate) : '?'}
            </span>
          </div>
        )}
        {trip.budget?.total !== undefined && (
          <div className="trip-meta-row">
            <DollarSign size={14} className="icon-muted" />
            <span>{formatBudget(trip.budget?.total, trip.budget?.currency)}</span>
          </div>
        )}
        {trip.members && trip.members.length > 0 && (
          <div className="trip-meta-row" style={{ marginTop: '0.5rem' }}>
            <CollabAvatars members={trip.members} />
          </div>
        )}
      </Link>
      {isOwner && (
        <div className="trip-card-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit && onEdit(trip)}>
            <Edit2 size={14} /> Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete && onDelete(trip._id)}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
      <style>{`
        .trip-card { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .trip-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
        .trip-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; gap: 0.5rem; }
        .trip-card-title { font-size: 1.05rem; font-weight: 700; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .trip-meta-row { display: flex; align-items: center; gap: 0.35rem; font-size: 0.85rem; color: #64748b; margin-bottom: 0.3rem; }
        .icon-muted { color: #94a3b8; flex-shrink: 0; }
        .trip-card-actions { display: flex; gap: 0.5rem; padding: 0.6rem 1.25rem; border-top: 1px solid #f1f5f9; background: #fafafa; }
      `}</style>
    </div>
  );
}
