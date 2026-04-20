import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  
  const [trips, setTrips] = useLocalStorage('travel_trips', [
    {
      id: '1',
      title: 'Summer in Tokyo',
      destination: 'Tokyo, Japan',
      startDate: '2026-06-15',
      endDate: '2026-06-25',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
      status: 'planning',
      budget: 4500,
      spent: 1250,
      currency: 'INR',
      visibility: 'private',
      createdAt: '2026-04-10T10:00:00Z',
      updatedAt: '2026-04-12T14:30:00Z',
      activitiesCount: 12,
      members: [
        { id: 'm1', name: 'Test User', email: 'test@example.com', role: 'admin', joinedAt: '2026-04-10T10:00:00Z', avatar: 'https://i.pravatar.cc/150?u=m1', online: true },
        { id: 'm2', name: 'Alex Travels', email: 'alex@example.com', role: 'editor', joinedAt: '2026-04-11T12:00:00Z', avatar: 'https://i.pravatar.cc/150?u=m2', online: false },
        { id: 'm3', name: 'Sarah Maps', email: 'sarah@example.com', role: 'viewer', joinedAt: '2026-04-12T09:30:00Z', avatar: 'https://i.pravatar.cc/150?u=m3', online: true }
      ],
      activityFeed: [
        { id: 'a1', user: 'Test User', action: 'created the trip', timestamp: '2026-04-10T10:00:00Z' },
        { id: 'a2', user: 'Test User', action: 'invited Alex Travels', timestamp: '2026-04-11T12:00:00Z' },
        { id: 'a3', user: 'Alex Travels', action: 'updated the budget', timestamp: '2026-04-11T14:20:00Z' }
      ]
    },
    {
      id: '2',
      title: 'European Backpacking',
      destination: 'Multiple',
      startDate: '2026-08-01',
      endDate: '2026-08-30',
      image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
      status: 'confirmed',
      budget: 6000,
      spent: 4200,
      currency: 'EUR',
      visibility: 'public',
      createdAt: '2026-03-05T09:15:00Z',
      updatedAt: '2026-04-01T11:20:00Z',
      activitiesCount: 24,
      members: [
        { id: 'm1', name: 'Test User', email: 'test@example.com', role: 'admin', joinedAt: '2026-03-05T09:15:00Z', avatar: 'https://i.pravatar.cc/150?u=m1', online: false },
        { id: 'm4', name: 'David Wander', email: 'david@example.com', role: 'editor', joinedAt: '2026-03-10T15:00:00Z', avatar: 'https://i.pravatar.cc/150?u=m4', online: false }
      ],
      activityFeed: [
        { id: 'a4', user: 'Test User', action: 'created the trip', timestamp: '2026-03-05T09:15:00Z' }
      ]
    }
  ]);

  const updateTrip = useCallback((id, updatedData) => {
    setTrips(prev => prev.map(trip => 
      trip.id === id ? { ...trip, ...updatedData, updatedAt: new Date().toISOString() } : trip
    ));
  }, []);

  const deleteTrip = useCallback((id) => {
    setTrips(prev => prev.filter(trip => trip.id !== id));
    addNotification('Trip deleted successfully', 'success');
  }, [addNotification]);

  const addMember = useCallback((tripId, member) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id === tripId) {
        return {
          ...trip,
          members: [...trip.members, member],
          activityFeed: [{ id: Math.random().toString(), user: user?.name || 'Admin', action: `invited ${member.name}`, timestamp: new Date().toISOString() }, ...trip.activityFeed]
        };
      }
      return trip;
    }));
  }, [user]);

  const removeMember = useCallback((tripId, memberId) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id === tripId) {
        const removedUser = trip.members.find(m => m.id === memberId)?.name;
        return {
          ...trip,
          members: trip.members.filter(m => m.id !== memberId),
          activityFeed: [{ id: Math.random().toString(), user: user?.name || 'Admin', action: `removed ${removedUser}`, timestamp: new Date().toISOString() }, ...trip.activityFeed]
        };
      }
      return trip;
    }));
  }, [user]);

  const updateMemberRole = useCallback((tripId, memberId, newRole) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id === tripId) {
        const updatedMembers = trip.members.map(m => m.id === memberId ? { ...m, role: newRole } : m);
        const updatedUser = trip.members.find(m => m.id === memberId)?.name;
        return {
          ...trip,
          members: updatedMembers,
          activityFeed: [{ id: Math.random().toString(), user: user?.name || 'Admin', action: `changed ${updatedUser}'s role to ${newRole}`, timestamp: new Date().toISOString() }, ...trip.activityFeed]
        };
      }
      return trip;
    }));
  }, [user]);

  // Function to simulate random socket events toggling online presence
  const toggleMemberPresence = useCallback((memberId, isOnline) => {
    setTrips(prev => prev.map(trip => ({
      ...trip,
      members: trip.members.map(m => m.id === memberId ? { ...m, online: isOnline } : m)
    })));
  }, []);

  const addTrip = useCallback((newTrip) => {
    setTrips(prev => [...prev, newTrip]);
  }, []);

  const value = useMemo(() => ({
    trips,
    setTrips,
    addTrip,
    updateTrip,
    deleteTrip,
    addMember,
    removeMember,
    updateMemberRole,
    toggleMemberPresence
  }), [trips, addTrip, updateTrip, deleteTrip, addMember, removeMember, updateMemberRole, toggleMemberPresence]);

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  );
};