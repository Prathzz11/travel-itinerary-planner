import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getPublicItineraries } from '../services/itineraryService';
import {
  getReviewsForTemplate,
  addReview as apiAddReview,
  updateReview as apiUpdateReview,
  deleteReview as apiDeleteReview,
  toggleHelpful as apiToggleHelpful
} from '../services/templateService';
import { useNotification } from './NotificationContext';

export const ExploreContext = createContext();

export const ExploreProvider = ({ children }) => {
  const { addNotification } = useNotification();
  
  const [publicTrips, setPublicTrips] = useState([]);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreError, setExploreError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Reviews cache
  const [reviewsCache, setReviewsCache] = useState({});

  const fetchPublicTrips = useCallback(async (params = {}) => {
    setExploreLoading(true);
    setExploreError(null);
    try {
      const res = await getPublicItineraries(params);
      const { templates, total, page, pages } = res.data;
      setPublicTrips(templates);
      setPagination({ page, pages, total });
    } catch (err) {
      console.error('Failed to load public itineraries:', err);
      setExploreError('Failed to load itineraries. Please try again.');
    } finally {
      setExploreLoading(false);
    }
  }, []);

  // Load on mount using a local async function to avoid synchronous setState in effect
  useEffect(() => {
    const load = async () => {
      setExploreLoading(true);
      setExploreError(null);
      try {
        const res = await getPublicItineraries({});
        const { templates, total, page, pages } = res.data;
        setPublicTrips(templates);
        setPagination({ page, pages, total });
      } catch (err) {
        console.error('Failed to load public itineraries:', err);
        setExploreError('Failed to load itineraries. Please try again.');
      } finally {
        setExploreLoading(false);
      }
    };
    load();
  }, []);

  const getTripById = useCallback((id) => publicTrips.find(t => t._id === id || t.id === id), [publicTrips]);
  const getTripsByUser = useCallback((userId) => publicTrips.filter(t => t.author?.toString() === userId || t.authorId === userId), [publicTrips]);

  const forkTrip = useCallback((id) => {
    setPublicTrips(prev => prev.map(t => (t._id === id || t.id === id) ? { ...t, forks: (t.forks || 0) + 1 } : t));
  }, []);

  const publishTrip = useCallback((tripData) => {
    const newTrip = {
      ...tripData,
      rating: 0,
      forks: 0,
      createdAt: new Date().toISOString()
    };
    setPublicTrips(prev => [newTrip, ...prev]);
  }, []);

  // --- Reviews Methods ---

  const loadTripReviews = useCallback(async (tripId) => {
    try {
      const res = await getReviewsForTemplate(tripId);
      setReviewsCache(prev => ({ ...prev, [tripId]: res.data }));
      return res.data;
    } catch (err) {
      console.error('Failed to load reviews:', err);
      return [];
    }
  }, []);

  const getTripReviews = useCallback((tripId) => reviewsCache[tripId] || [], [reviewsCache]);

  const addReview = useCallback(async (tripId, reviewData) => {
    try {
      const res = await apiAddReview(tripId, reviewData);
      setReviewsCache(prev => ({
        ...prev,
        [tripId]: [res.data, ...(prev[tripId] || [])]
      }));
      addNotification('Review added successfully', 'success');
      
      // Update template rating locally for immediate feedback
      setPublicTrips(prev => prev.map(t => {
        if (t._id === tripId) {
          const currentReviews = reviewsCache[tripId] || [];
          const newCount = currentReviews.length + 1;
          const newAvg = (currentReviews.reduce((sum, r) => sum + r.rating, 0) + res.data.rating) / newCount;
          return { ...t, rating: newAvg.toFixed(1), reviewCount: newCount };
        }
        return t;
      }));

      return res.data;
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to add review', 'error');
      throw err;
    }
  }, [reviewsCache, addNotification]);

  const editReview = useCallback(async (reviewId, tripId, updatedData) => {
    try {
      const res = await apiUpdateReview(reviewId, updatedData);
      setReviewsCache(prev => ({
        ...prev,
        [tripId]: (prev[tripId] || []).map(r => r._id === reviewId ? res.data : r)
      }));
      addNotification('Review updated', 'success');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to update review', 'error');
      throw err;
    }
  }, [addNotification]);

  const deleteReview = useCallback(async (reviewId, tripId) => {
    try {
      await apiDeleteReview(reviewId);
      setReviewsCache(prev => ({
        ...prev,
        [tripId]: (prev[tripId] || []).filter(r => r._id !== reviewId)
      }));
      addNotification('Review deleted', 'success');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to delete review', 'error');
      throw err;
    }
  }, [addNotification]);

  const toggleHelpful = useCallback(async (reviewId, tripId) => {
    try {
      const res = await apiToggleHelpful(reviewId);
      setReviewsCache(prev => ({
        ...prev,
        [tripId]: (prev[tripId] || []).map(r => r._id === reviewId ? res.data : r)
      }));
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to mark helpful', 'error');
    }
  }, [addNotification]);

  return (
    <ExploreContext.Provider value={{
      publicTrips,
      exploreLoading,
      exploreError,
      pagination,
      fetchPublicTrips,
      getTripById,
      getTripsByUser,
      forkTrip,
      publishTrip,
      // Review exports
      loadTripReviews,
      getTripReviews,
      addReview,
      editReview,
      deleteReview,
      toggleHelpful
    }}>
      {children}
    </ExploreContext.Provider>
  );
};
