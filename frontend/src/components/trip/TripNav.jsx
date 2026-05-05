import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Info, Map, IndianRupee, Users, Ticket, Handshake, ArrowLeft, Share2 } from 'lucide-react';
import { NotificationContext } from '../../contexts/NotificationContext';

const TripNav = ({ tripId }) => {
  const navigate = useNavigate();
  const { addNotification } = useContext(NotificationContext);
  
  // Ensure tripId is a string (handles potential ObjectId objects from context)
  const id = typeof tripId === 'object' ? (tripId._id || tripId.id || String(tripId)) : tripId;

  const handleShare = () => {
    const url = `${window.location.origin}/trip/${id}`;
    navigator.clipboard.writeText(url)
      .then(() => addNotification('Trip link copied to clipboard!', 'success'))
      .catch(() => addNotification('Failed to copy link', 'error'));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Back to Control Room
        </button>
        <button className="btn btn-link text-decoration-none d-flex align-items-center gap-1 no-print" style={{ color: 'var(--color-primary)', fontWeight: 600 }} onClick={handleShare}>
          <Share2 size={16} /> Share Trip
        </button>
      </div>

      <ul className="nav nav-tabs mb-3 no-print">
        <li className="nav-item">
          <NavLink to={`/trip/${id}`} end className={({ isActive }) => `nav-link d-flex align-items-center gap-1 ${isActive ? 'active' : ''}`}>
            <Info size={16} /> Overview
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to={`/trip/${id}/itinerary`} className={({ isActive }) => `nav-link d-flex align-items-center gap-1 ${isActive ? 'active' : ''}`}>
            <Map size={16} /> Flight Plan
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to={`/trip/${id}/budget`} className={({ isActive }) => `nav-link d-flex align-items-center gap-1 ${isActive ? 'active' : ''}`}>
            <IndianRupee size={16} /> Resource Allocation
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to={`/trip/${id}/settlements`} className={({ isActive }) => `nav-link d-flex align-items-center gap-1 ${isActive ? 'active' : ''}`}>
            <Handshake size={16} /> Settle Up
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to={`/trip/${id}/bookings`} className={({ isActive }) => `nav-link d-flex align-items-center gap-1 ${isActive ? 'active' : ''}`}>
            <Ticket size={16} /> Logistics
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to={`/trip/${id}/members`} className={({ isActive }) => `nav-link d-flex align-items-center gap-1 ${isActive ? 'active' : ''}`}>
            <Users size={16} /> The Crew
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default TripNav;
