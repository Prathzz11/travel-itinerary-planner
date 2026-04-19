import { useContext } from 'react';
import { TripContext } from '../contexts/TripContext';
export const useTrip = () => useContext(TripContext);