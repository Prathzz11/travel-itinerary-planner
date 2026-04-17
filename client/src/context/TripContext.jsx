import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/trips');
      setTrips(res.data.trips || res.data);
    } catch (err) {
      console.error('fetchTrips error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrip = async (data) => {
    const res = await api.post('/trips', data);
    const newTrip = res.data.trip || res.data;
    setTrips((prev) => [newTrip, ...prev]);
    return newTrip;
  };

  const updateTrip = async (id, data) => {
    const res = await api.put(`/trips/${id}`, data);
    const updated = res.data.trip || res.data;
    setTrips((prev) => prev.map((t) => (t._id === id ? updated : t)));
    if (currentTrip?._id === id) setCurrentTrip(updated);
    return updated;
  };

  const deleteTrip = async (id) => {
    await api.delete(`/trips/${id}`);
    setTrips((prev) => prev.filter((t) => t._id !== id));
    if (currentTrip?._id === id) setCurrentTrip(null);
  };

  return (
    <TripContext.Provider
      value={{ trips, currentTrip, loading, fetchTrips, createTrip, updateTrip, deleteTrip, setCurrentTrip }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripContext must be used within TripProvider');
  return ctx;
}
