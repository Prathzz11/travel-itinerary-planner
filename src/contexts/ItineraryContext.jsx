import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { SocketContext } from './SocketContext';
import { useNotification } from './NotificationContext';

export const ItineraryContext = createContext();

export const ItineraryProvider = ({ children }) => {
  const { user } = useAuth();
  const socketContext = useContext(SocketContext);
  const { socket, emitAction } = socketContext || {};
  const { addNotification } = useNotification();
  
  const [itineraries, setItineraries] = useState({
    '1': [
      { id: 1, day: 1, date: '2026-06-15', activities: [
        { id: 101, title: 'Arrive at Airport', time: '10:00', duration: '2h', category: 'Transport', location: 'Tokyo Haneda Airport', lat: 35.5494, lng: 139.7798, cost: 0, currency: 'USD', notes: 'Flight JL001. Pick up JR Pass.', images: [], creator: 'Test User' },
        { id: 102, title: 'Hotel Check-in', time: '12:00', duration: '1h', category: 'Accommodation', location: 'Shinjuku Prince Hotel', lat: 35.6943, lng: 139.7005, cost: 150, currency: 'USD', notes: 'Confirmation #123456.', images: [], creator: 'Test User' },
        { id: 103, title: 'Explore Shinjuku', time: '14:00', duration: '4h', category: 'Sightseeing', location: 'Shinjuku, Tokyo', lat: 35.6895, lng: 139.6917, cost: 50, currency: 'USD', notes: 'Visit Godzilla head and Golden Gai.', images: ['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=300&q=80'], creator: 'Alex Travels' }
      ]},
      { id: 2, day: 2, date: '2026-06-16', activities: [
        { id: 201, title: 'Tsukiji Outer Market', time: '08:00', duration: '3h', category: 'Dining', location: 'Tsukiji, Tokyo', lat: 35.6655, lng: 139.7707, cost: 80, currency: 'USD', notes: 'Try the fresh sushi and tamagoyaki.', images: [], creator: 'Test User' },
        { id: 202, title: 'teamLab Planets', time: '13:00', duration: '3h', category: 'Entertainment', location: 'Toyosu, Tokyo', lat: 35.6477, lng: 139.7891, cost: 35, currency: 'USD', notes: 'Wear pants that can be rolled up (water exhibit).', images: [], creator: 'Test User' }
      ]}
    ]
  });

  const getItinerary = useCallback((tripId) => itineraries[tripId] || [], [itineraries]);

  useEffect(() => {
    if (socket) {
      const handleAction = ({ action, payload }) => {
        if (action === 'ADD_ACTIVITY') {
          setItineraries(prev => {
            const tripItin = prev[payload.tripId] || [];
            return {
              ...prev,
              [payload.tripId]: tripItin.map(day => day.id === payload.dayId ? { ...day, activities: [...day.activities, payload.data] } : day)
            };
          });
        } else if (action === 'DELETE_ACTIVITY') {
          setItineraries(prev => {
            const tripItin = prev[payload.tripId] || [];
            return {
              ...prev,
              [payload.tripId]: tripItin.map(day => day.id === payload.dayId ? { ...day, activities: day.activities.filter(a => a.id !== payload.id) } : day)
            };
          });
        } else if (action === 'UPDATE_ACTIVITY') {
          setItineraries(prev => {
            const tripItin = prev[payload.tripId] || [];
            return {
              ...prev,
              [payload.tripId]: tripItin.map(day => day.id === payload.dayId ? { ...day, activities: day.activities.map(a => a.id === payload.data.id ? payload.data : a) } : day)
            };
          });
        }
      };
      socket.on('receive_action', handleAction);
      return () => socket.off('receive_action', handleAction);
    }
  }, [socket]);

  const addActivity = useCallback((tripId, dayId, activityData) => {
    setItineraries(prev => {
      const tripItin = prev[tripId] || [];
      const updatedItin = tripItin.map(day => {
        if (day.id === dayId) {
          const newActivity = {
            ...activityData,
            id: Math.random().toString(36).substr(2, 9),
            creator: user?.name || 'Unknown',
            createdAt: new Date().toISOString()
          };
          if (emitAction) emitAction(tripId, 'ADD_ACTIVITY', { tripId, dayId, data: newActivity });
          return {
            ...day,
            activities: [...day.activities, newActivity]
          };
        }
        return day;
      });
      return { ...prev, [tripId]: updatedItin };
    });
    addNotification('Activity added successfully', 'success');
  }, [user, emitAction, addNotification]);

  const updateActivity = useCallback((tripId, dayId, activityId, updatedData) => {
    setItineraries(prev => {
      const tripItin = prev[tripId] || [];
      const updatedItin = tripItin.map(day => {
        if (day.id === dayId) {
          const updatedActivities = day.activities.map(act => act.id === activityId ? { ...act, ...updatedData } : act);
          const updatedActivity = updatedActivities.find(a => a.id === activityId);
          if (emitAction) emitAction(tripId, 'UPDATE_ACTIVITY', { tripId, dayId, data: updatedActivity });
          return {
            ...day,
            activities: updatedActivities
          };
        }
        return day;
      });
      return { ...prev, [tripId]: updatedItin };
    });
    addNotification('Activity updated', 'success');
  }, [emitAction, addNotification]);

  const deleteActivity = useCallback((tripId, dayId, activityId) => {
    if (emitAction) emitAction(tripId, 'DELETE_ACTIVITY', { tripId, dayId, id: activityId });
    setItineraries(prev => {
      const tripItin = prev[tripId] || [];
      const updatedItin = tripItin.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            activities: day.activities.filter(act => act.id !== activityId)
          };
        }
        return day;
      });
      return { ...prev, [tripId]: updatedItin };
    });
    addNotification('Activity removed', 'info');
  }, [emitAction, addNotification]);

  const reorderActivities = useCallback((tripId, dayId, reorderedActivities) => {
    // We only emit the reorder action if we need to sync over sockets
    // For now, let's assume it's just local client update
    setItineraries(prev => {
      const tripItin = prev[tripId] || [];
      const updatedItin = tripItin.map(day => {
        if (day.id === dayId) {
          return {
            ...day,
            activities: reorderedActivities
          };
        }
        return day;
      });
      return { ...prev, [tripId]: updatedItin };
    });
  }, []);

  const value = useMemo(() => ({
    getItinerary, addActivity, updateActivity, deleteActivity, reorderActivities
  }), [getItinerary, addActivity, updateActivity, deleteActivity, reorderActivities]);

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
};