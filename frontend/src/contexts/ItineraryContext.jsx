import React, { createContext, useState, useCallback, useMemo } from 'react';
import { useNotification } from './NotificationContext';
import { getItinerary as apiGetItinerary, updateItinerary as apiUpdateItinerary } from '../services/itineraryService';

export const ItineraryContext = createContext();

export const ItineraryProvider = ({ children }) => {
  const { addNotification } = useNotification();

  // Cache: { [tripId]: itineraryDoc }
  const [itineraryCache, setItineraryCache] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  const getItinerary = useCallback(async (tripId) => {
    if (itineraryCache[tripId]) return itineraryCache[tripId];

    setLoadingMap(prev => ({ ...prev, [tripId]: true }));
    try {
      const res = await apiGetItinerary(tripId);
      setItineraryCache(prev => ({ ...prev, [tripId]: res.data }));
      return res.data;
    } catch (err) {
      console.error('Failed to fetch itinerary:', err);
      addNotification(err.userMessage || 'Failed to load Flight Plan', 'error');
      return null;
    } finally {
      setLoadingMap(prev => ({ ...prev, [tripId]: false }));
    }
  }, [itineraryCache]);

  // Persist entire days array to server
  const saveItinerary = useCallback(async (tripId, days, notes = '') => {
    try {
      const res = await apiUpdateItinerary(tripId, { days, notes });
      setItineraryCache(prev => ({ ...prev, [tripId]: res.data }));
      return res.data;
    } catch (err) {
      addNotification('Failed to save itinerary', 'error');
      throw err;
    }
  }, [addNotification]);

  const addActivity = useCallback(async (tripId, dayDate, activityData) => {
    const current = itineraryCache[tripId];
    if (!current) return;

    const updatedDays = current.days.map(day => {
      if (day.date === dayDate) {
        return {
          ...day,
          activities: [...day.activities, { ...activityData, order: day.activities.length }]
        };
      }
      return day;
    });

    await saveItinerary(tripId, updatedDays, current.notes);
    addNotification('Activity added successfully', 'success');
  }, [itineraryCache, saveItinerary, addNotification]);

  const updateActivity = useCallback(async (tripId, dayDate, activityId, updatedData) => {
    const current = itineraryCache[tripId];
    if (!current) return;

    const updatedDays = current.days.map(day => {
      if (day.date === dayDate) {
        return {
          ...day,
          activities: day.activities.map(act =>
            (act._id === activityId || act.id === activityId) ? { ...act, ...updatedData } : act
          )
        };
      }
      return day;
    });

    await saveItinerary(tripId, updatedDays, current.notes);
    addNotification('Activity updated', 'success');
  }, [itineraryCache, saveItinerary, addNotification]);

  const deleteActivity = useCallback(async (tripId, dayDate, activityId) => {
    const current = itineraryCache[tripId];
    if (!current) return;

    const updatedDays = current.days.map(day => {
      if (day.date === dayDate) {
        return {
          ...day,
          activities: day.activities.filter(act => act._id !== activityId && act.id !== activityId)
        };
      }
      return day;
    });

    await saveItinerary(tripId, updatedDays, current.notes);
    addNotification('Activity removed', 'info');
  }, [itineraryCache, saveItinerary, addNotification]);

  const reorderActivities = useCallback(async (tripId, dayDate, reorderedActivities) => {
    const current = itineraryCache[tripId];
    if (!current) return;

    const updatedDays = current.days.map(day => {
      if (day.date === dayDate) {
        return { ...day, activities: reorderedActivities };
      }
      return day;
    });

    await saveItinerary(tripId, updatedDays, current.notes);
  }, [itineraryCache, saveItinerary]);

  const isLoading = useCallback((tripId) => !!loadingMap[tripId], [loadingMap]);

  const value = useMemo(() => ({
    itineraryCache,
    getItinerary,
    saveItinerary,
    addActivity,
    updateActivity,
    deleteActivity,
    reorderActivities,
    isLoading
  }), [itineraryCache, getItinerary, saveItinerary, addActivity, updateActivity, deleteActivity, reorderActivities, isLoading]);

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
};