import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchTrips, createTrip as apiCreateTrip, updateTrip as apiUpdateTrip, deleteTrip as apiDeleteTrip, addMember as apiAddMember, removeMember as apiRemoveMember, updateMemberRole as apiUpdateMemberRole, importTrip as apiImportTrip } from '../services/tripService';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

export const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState(null);

  // Load trips from API whenever user logs in/out
  useEffect(() => {
    if (!user) {
      setTrips([]);
      return;
    }

    const loadTrips = async () => {
      setTripsLoading(true);
      setTripsError(null);
      try {
        const res = await fetchTrips();
        setTrips(res.data);
      } catch (err) {
        console.error('Failed to load trips:', err);
        setTripsError('Failed to load trips');
      } finally {
        setTripsLoading(false);
      }
    };

    loadTrips();
  }, [user]);

  const refreshTrips = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetchTrips();
      setTrips(res.data);
    } catch (err) {
      console.error('Failed to refresh trips:', err);
    }
  }, [user]);

  const addTrip = useCallback(async (tripData) => {
    try {
      const res = await apiCreateTrip(tripData);
      setTrips(prev => [res.data, ...prev]);
      addNotification('Trip created successfully!', 'success');
      return res.data;
    } catch (err) {
      addNotification(err.userMessage || 'Failed to create trip', 'error');
      throw err;
    }
  }, [addNotification]);

  const updateTrip = useCallback(async (id, updatedData) => {
    try {
      const res = await apiUpdateTrip(id, updatedData);
      setTrips(prev => prev.map(t => t._id === id || t.id === id ? res.data : t));
      addNotification('Trip updated', 'success');
      return res.data;
    } catch (err) {
      addNotification(err.userMessage || 'Failed to update trip', 'error');
      throw err;
    }
  }, [addNotification]);

  const deleteTrip = useCallback(async (id) => {
    try {
      await apiDeleteTrip(id);
      setTrips(prev => prev.filter(t => t._id !== id && t.id !== id));
      addNotification('Trip deleted successfully', 'success');
    } catch (err) {
      addNotification(err.userMessage || 'Failed to delete trip', 'error');
      throw err;
    }
  }, [addNotification]);

  const addMember = useCallback(async (tripId, memberData) => {
    try {
      const res = await apiAddMember(tripId, memberData);
      setTrips(prev => prev.map(t => (t._id === tripId || t.id === tripId) ? res.data : t));
      addNotification(`${memberData.name} added to trip`, 'success');
    } catch (err) {
      addNotification(err.userMessage || 'Failed to add member', 'error');
      throw err;
    }
  }, [addNotification]);

  const removeMember = useCallback(async (tripId, memberId) => {
    try {
      const res = await apiRemoveMember(tripId, memberId);
      setTrips(prev => prev.map(t => (t._id === tripId || t.id === tripId) ? res.data : t));
      addNotification('Member removed', 'info');
    } catch (err) {
      addNotification(err.userMessage || 'Failed to remove member', 'error');
      throw err;
    }
  }, [addNotification]);

  const updateMemberRole = useCallback(async (tripId, memberId, newRole) => {
    try {
      const res = await apiUpdateMemberRole(tripId, memberId, newRole);
      setTrips(prev => prev.map(t => (t._id === tripId || t.id === tripId) ? res.data : t));
      addNotification('Member role updated', 'success');
    } catch (err) {
      addNotification(err.userMessage || 'Failed to update role', 'error');
      throw err;
    }
  }, [addNotification]);

  // Kept for socket simulation compatibility
  const toggleMemberPresence = useCallback((memberId, isOnline) => {
    setTrips(prev => prev.map(trip => ({
      ...trip,
      members: trip.members.map(m => m._id === memberId || m.id === memberId ? { ...m, online: isOnline } : m)
    })));
  }, []);

  const importTrip = useCallback(async (tripData) => {
    try {
      const res = await apiImportTrip(tripData);
      setTrips(prev => [res.data, ...prev]);
      addNotification('Trip imported successfully!', 'success');
      return res.data;
    } catch (err) {
      addNotification(err.userMessage || 'Failed to import trip', 'error');
      throw err;
    }
  }, [addNotification]);

  const value = useMemo(() => ({
    trips,
    tripsLoading,
    tripsError,
    setTrips,
    addTrip,
    importTrip,
    updateTrip,
    deleteTrip,
    addMember,
    removeMember,
    updateMemberRole,
    toggleMemberPresence,
    refreshTrips
  }), [trips, tripsLoading, tripsError, addTrip, importTrip, updateTrip, deleteTrip, addMember, removeMember, updateMemberRole, toggleMemberPresence, refreshTrips]);

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};