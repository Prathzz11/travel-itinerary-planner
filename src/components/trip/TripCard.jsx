import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, IndianRupee, Edit2, Trash2, Users } from 'lucide-react';
import { formatTripDates, getTripDuration, formatCurrency } from '../../utils/formatters';
import { getTripStatus, getBudgetStatus } from '../../utils/categoryConfig';
import ConfirmDialog from '../ui/ConfirmDialog';

const TripCard = ({ trip, onDelete }) => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const status = useMemo(() => getTripStatus(trip.startDate, trip.endDate), [trip.startDate, trip.endDate]);
  const duration = useMemo(() => getTripDuration(trip.startDate, trip.endDate), [trip.startDate, trip.endDate]);
  const totalSpent = trip.spent || 0;
  const budgetPercent = trip.budget > 0 ? Math.min((totalSpent / trip.budget) * 100, 100) : 0;
  const budgetSt = getBudgetStatus(budgetPercent);
  const memberCount = trip.members?.length || 1;
  const budgetPerPerson = trip.budget > 0 ? trip.budget / memberCount : 0;

  const handleDelete = (e) => { e.preventDefault(); e.stopPropagation(); setConfirmOpen(true); };

  return (
    <>
      <div className="card hover-lift position-relative" style={{ overflow: 'hidden' }}>
        {/* Image */}
        <div className="position-relative" style={{ height: 160, overflow: 'hidden' }}>
          <img src={trip.image} alt={trip.destination} className="w-100 h-100" style={{ objectFit: 'cover' }} />
          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />

          {duration && (
            <span className="badge position-absolute bottom-0 start-0 m-2 d-flex align-items-center gap-1" style={{ background: 'rgba(0,0,0,0.7)', fontSize: '0.75rem' }}>
              <Clock size={11} /> {duration}
            </span>
          )}
          <span className="badge position-absolute top-0 end-0 m-2" style={{ background: status.bg, color: status.color, border: `1px solid ${status.color}40`, fontSize: '0.75rem' }}>
            {status.label}
          </span>

          {/* Hover Actions */}
          <div className="trip-card-actions position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center gap-2" style={{ background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s' }}>
            <button className="btn btn-primary btn-sm rounded-circle p-2" onClick={(e) => { e.preventDefault(); navigate(`/trip/${trip.id}`); }} aria-label="Open trip"><Edit2 size={16} /></button>
            <button className="btn btn-danger btn-sm rounded-circle p-2" onClick={handleDelete} aria-label="Delete trip"><Trash2 size={16} /></button>
          </div>
        </div>

        <div className="card-body d-flex flex-column gap-2">
          <div>
            <h3 className="fs-6 fw-semibold mb-1">{trip.title}</h3>
            <div className="text-muted small d-flex align-items-center gap-1"><MapPin size={13} /> {trip.destination}</div>
          </div>
          <div className="text-muted small d-flex align-items-center gap-1"><Calendar size={13} /> {formatTripDates(trip.startDate, trip.endDate)}</div>
          
          {/* Members */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {trip.members?.slice(0, 3).map((m, i) => (
                <img key={m.id} src={m.avatar} alt={m.name} title={m.name} className="rounded-circle" style={{ width: 24, height: 24, objectFit: 'cover', border: '2px solid var(--bs-body-bg)', marginLeft: i > 0 ? -8 : 0, zIndex: 10 - i }} />
              ))}
              {trip.members?.length > 3 && <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, marginLeft: -8, zIndex: 7, background: 'var(--color-surface)', fontSize: '0.65rem', fontWeight: 'bold', border: '2px solid var(--bs-body-bg)' }}>+{trip.members.length - 3}</div>}
            </div>
            {budgetPerPerson > 0 && <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}><Users size={11} /> {formatCurrency(budgetPerPerson)}/ea</div>}
          </div>

          {/* Budget Bar */}
          {trip.budget > 0 && (
            <div className="pt-2 border-top">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted d-flex align-items-center gap-1"><IndianRupee size={11} /> Budget</span>
                <span className="fw-semibold" style={{ color: budgetSt.color }}>{budgetSt.label}</span>
              </div>
              <div className="progress" style={{ height: 5 }}>
                <div className="progress-bar" role="progressbar" style={{ width: `${Math.min(budgetPercent, 100)}%`, background: budgetSt.color }} />
              </div>
            </div>
          )}
        </div>

        <Link to={`/trip/${trip.id}`} className="stretched-link" />

        <style>{`.card:hover .trip-card-actions { opacity: 1 !important; }`}</style>
      </div>

      <ConfirmDialog isOpen={confirmOpen} title={`Delete "${trip.title}"?`} message="This action is permanent and cannot be undone." confirmLabel="Delete Trip" onConfirm={() => { setConfirmOpen(false); if (onDelete) onDelete(trip.id); }} onCancel={() => setConfirmOpen(false)} />
    </>
  );
};

export default TripCard;
