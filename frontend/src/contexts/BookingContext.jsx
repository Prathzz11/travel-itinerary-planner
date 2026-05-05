import React, { createContext, useState, useCallback, useMemo } from 'react';
import { useNotification } from './NotificationContext';
import {
  getBookings as apiGetBookings,
  createBooking as apiCreateBooking,
  updateBooking as apiUpdateBooking,
  deleteBooking as apiDeleteBooking
} from '../services/bookingService';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  // Cache: { [tripId]: booking[] }
  const { addNotification } = useNotification();
  const [bookingCache, setBookingCache] = useState({});

  const loadBookings = useCallback(async (tripId) => {
    try {
      const res = await apiGetBookings(tripId);
      setBookingCache(prev => ({ ...prev, [tripId]: res.data }));
      return res.data;
    } catch (err) {
      console.error('Failed to load bookings:', err);
      addNotification(err.userMessage || 'Failed to load logistics data', 'error');
      return [];
    }
  }, []);

  const getBookings = useCallback((tripId) => bookingCache[tripId] || [], [bookingCache]);

  const addBooking = useCallback(async (tripId, bookingData) => {
    try {
      const res = await apiCreateBooking(tripId, bookingData);
      setBookingCache(prev => ({
        ...prev,
        [tripId]: [...(prev[tripId] || []), res.data]
      }));
      return res.data;
    } catch (err) {
      console.error('Failed to add booking:', err);
      throw err;
    }
  }, []);

  const updateBooking = useCallback(async (tripId, bookingId, updatedData) => {
    try {
      const res = await apiUpdateBooking(tripId, bookingId, updatedData);
      setBookingCache(prev => ({
        ...prev,
        [tripId]: (prev[tripId] || []).map(b =>
          (b._id === bookingId || b.id === bookingId) ? res.data : b
        )
      }));
      return res.data;
    } catch (err) {
      console.error('Failed to update booking:', err);
      throw err;
    }
  }, []);

  const deleteBooking = useCallback(async (tripId, bookingId) => {
    try {
      await apiDeleteBooking(tripId, bookingId);
      setBookingCache(prev => ({
        ...prev,
        [tripId]: (prev[tripId] || []).filter(b => b._id !== bookingId && b.id !== bookingId)
      }));
    } catch (err) {
      console.error('Failed to delete booking:', err);
      throw err;
    }
  }, []);

  const value = useMemo(() => ({
    getBookings,
    loadBookings,
    addBooking,
    updateBooking,
    deleteBooking
  }), [getBookings, loadBookings, addBooking, updateBooking, deleteBooking]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
