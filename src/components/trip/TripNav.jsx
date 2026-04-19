import React, { useEffect, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Info, Map, DollarSign, Users, Ticket, Handshake, ArrowLeft, Share2 } from 'lucide-react';
import { SocketContext } from '../../contexts/SocketContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const TripNav = ({ tripId }) => {
  const navigate = useNavigate();
  const socketContext = useContext(SocketContext);
  const { addNotification } = useContext(NotificationContext);
  const { joinTripRoom, typingUsers, activeUsers } = socketContext || {};

  useEffect(() => {
    if (joinTripRoom && tripId) {
      joinTripRoom(tripId);
    }
  }, [joinTripRoom, tripId]);

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: 'var(--space-3) var(--space-4)',
    color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
    borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
    fontWeight: isActive ? 600 : 400,
    transition: 'all 0.2s ease',
    textDecoration: 'none'
  });

  const handleShare = () => {
    const url = `${window.location.origin}/trip/${tripId}`;
    navigator.clipboard.writeText(url)
      .then(() => addNotification('Trip link copied to clipboard!', 'success'))
      .catch(() => addNotification('Failed to copy link', 'error'));
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', 
            color: 'var(--color-text-muted)', padding: '6px 12px', borderRadius: 'var(--radius-full)',
            cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s ease'
          }}
          onMouseOver={e => { e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseOut={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        
        <button 
          className="hide-on-print"
          onClick={handleShare}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            background: 'transparent', border: 'none', 
            color: 'var(--color-primary)', padding: '6px 12px', borderRadius: 'var(--radius-full)',
            cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s ease', fontWeight: 600
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Share2 size={16} /> Share Trip
        </button>
      </div>

      <div className="hide-on-print" style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-2)' }}>
        <NavLink to={`/trip/${tripId}`} end style={linkStyle}>
        <Info size={18} /> Overview
      </NavLink>
      <NavLink to={`/trip/${tripId}/itinerary`} style={linkStyle}>
        <Map size={18} /> Itinerary
      </NavLink>
      <NavLink to={`/trip/${tripId}/budget`} style={linkStyle}>
        <DollarSign size={18} /> Budget
      </NavLink>
      <NavLink to={`/trip/${tripId}/settlements`} style={linkStyle}>
        <Handshake size={18} /> Settle Up
      </NavLink>
      <NavLink to={`/trip/${tripId}/bookings`} style={linkStyle}>
        <Ticket size={18} /> Bookings
      </NavLink>
      <NavLink to={`/trip/${tripId}/members`} style={linkStyle}>
        <Users size={18} /> Members
      </NavLink>
      </div>
      
      <div style={{ height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeUsers?.length > 0 && (
             <>
               <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }}></span>
               {activeUsers.length} user{activeUsers.length > 1 ? 's' : ''} online
             </>
          )}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          <AnimatePresence>
            {typingUsers?.length > 0 && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {typingUsers.map(u => u.name).join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TripNav;
