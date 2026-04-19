import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, DollarSign, Edit2, Trash2, Users } from 'lucide-react';
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

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(true);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5, boxShadow: '0 10px 40px -10px rgba(56,189,248,0.3)' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel"
        style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}
      >
        {/* Card Image */}
        <div style={{ height: '160px', width: '100%', position: 'relative', overflow: 'hidden' }}>
          <img
            src={trip.image}
            alt={trip.destination}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          />
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />

          {/* Duration badge */}
          {duration && (
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '3px 8px', borderRadius: '20px', fontSize: '0.75rem', color: 'white', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} /> {duration}
            </div>
          )}

          {/* Status Badge */}
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: status.bg, backdropFilter: 'blur(4px)',
            border: `1px solid ${status.color}40`,
            padding: '4px 10px', borderRadius: '20px',
            fontSize: '0.75rem', fontWeight: 700,
            color: status.color
          }}>
            {status.label}
          </div>

          {/* Quick Actions Overlay */}
          <div className="trip-card-actions" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <button onClick={(e) => { e.preventDefault(); navigate(`/trip/${trip.id}`); }} title="Open Trip" aria-label="Open trip" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Edit2 size={18} />
            </button>
            <button onClick={handleDelete} title="Delete Trip" aria-label="Delete trip" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-danger)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div>
            <h3 style={{ margin: '0 0 var(--space-1) 0', fontSize: '1.15rem', lineHeight: 1.3 }}>{trip.title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
              <MapPin size={13} /> {trip.destination}
            </div>
          </div>

          {/* Date Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            <Calendar size={13} />
            {formatTripDates(trip.startDate, trip.endDate)}
          </div>

          {/* Members Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '0' }}>
              {trip.members?.slice(0, 3).map((m, i) => (
                <img key={m.id} src={m.avatar} alt={m.name} title={m.name} style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--color-bg)', marginLeft: i > 0 ? '-8px' : '0', zIndex: 10 - i, objectFit: 'cover' }} />
              ))}
              {trip.members?.length > 3 && (
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--color-bg)', marginLeft: '-8px', zIndex: 7, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold' }}>
                  +{trip.members.length - 3}
                </div>
              )}
            </div>
            {budgetPerPerson > 0 && (
              <div title={`Budget per person: ${formatCurrency(budgetPerPerson)}`} style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={11} /> {formatCurrency(budgetPerPerson)}/ea
              </div>
            )}
          </div>

          {/* Budget Bar */}
          {trip.budget > 0 && (
            <div style={{ paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '5px' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}><DollarSign size={11}/> Budget</span>
                <span style={{ color: budgetSt.color, fontWeight: 600 }}>{budgetSt.label}</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(budgetPercent, 100)}%`, height: '100%', background: budgetSt.color, transition: 'width 0.5s ease, background 0.3s ease', borderRadius: '3px' }} />
              </div>
            </div>
          )}
        </div>

        <style>{`
          .glass-panel:hover .trip-card-actions {
            opacity: 1 !important;
          }
        `}</style>

        <Link to={`/trip/${trip.id}`} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
      </motion.div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title={`Delete "${trip.title}"?`}
        message="This action is permanent and cannot be undone. All itinerary data, expenses, and members will be removed."
        confirmLabel="Delete Trip"
        onConfirm={() => { setConfirmOpen(false); if (onDelete) onDelete(trip.id); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default TripCard;
