import React, { createContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState({
    '1': [
      {
        id: 'b1',
        type: 'hotel',
        name: 'Shinjuku Prince Hotel',
        address: '1-30-1 Kabukicho, Shinjuku City, Tokyo',
        checkIn: '2026-06-15T14:00',
        checkOut: '2026-06-20T11:00',
        roomType: 'Double Room - Non Smoking',
        cost: 750,
        currency: 'USD',
        amenities: ['WiFi', 'Breakfast', 'Gym'],
        bookingRef: 'HTL-847291',
        link: 'https://example.com/booking',
        images: ['https://images.unsplash.com/photo-1551882547-ff40c0d13c84?auto=format&fit=crop&w=600&q=80'],
        creator: 'Test User'
      },
      {
        id: 'b2',
        type: 'flight',
        airline: 'Japan Airlines',
        flightNumber: 'JL001',
        departureTime: '2026-06-14T08:00',
        arrivalTime: '2026-06-15T10:00',
        cost: 1200,
        currency: 'USD',
        bookingRef: 'FLT-XYZ789',
        link: 'https://example.com/flight',
        creator: 'Test User'
      }
    ]
  });

  const getBookings = useCallback((tripId) => bookings[tripId] || [], [bookings]);

  const addBooking = useCallback((tripId, bookingData) => {
    setBookings(prev => {
      const tripBookings = prev[tripId] || [];
      const newBooking = {
        ...bookingData,
        id: Math.random().toString(36).substr(2, 9),
        creator: user?.name || 'Unknown'
      };
      return { ...prev, [tripId]: [...tripBookings, newBooking] };
    });
  }, [user]);

  const updateBooking = useCallback((tripId, bookingId, updatedData) => {
    setBookings(prev => {
      const tripBookings = prev[tripId] || [];
      return {
        ...prev,
        [tripId]: tripBookings.map(b => b.id === bookingId ? { ...b, ...updatedData } : b)
      };
    });
  }, []);

  const deleteBooking = useCallback((tripId, bookingId) => {
    setBookings(prev => {
      const tripBookings = prev[tripId] || [];
      return {
        ...prev,
        [tripId]: tripBookings.filter(b => b.id !== bookingId)
      };
    });
  }, []);

  const value = useMemo(() => ({
    getBookings, addBooking, updateBooking, deleteBooking
  }), [getBookings, addBooking, updateBooking, deleteBooking]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
