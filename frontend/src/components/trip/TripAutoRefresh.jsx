import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTrip } from '../../hooks/useTrip';
import { ExpenseContext } from '../../contexts/ExpenseContext';
import { BookingContext } from '../../contexts/BookingContext';
import { ItineraryContext } from '../../contexts/ItineraryContext';
import { startAutoRefresh } from '../../utils/autoRefresh';

export default function TripAutoRefresh() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { refreshTrips } = useTrip();
  const { loadExpenses, loadSettlements } = useContext(ExpenseContext);
  const { loadBookings } = useContext(BookingContext);
  const { getItinerary } = useContext(ItineraryContext);
  useEffect(() => {
    if (!user || !(pathname === '/dashboard' || pathname.startsWith('/trip/'))) return;
    let active = true;
    const stop = startAutoRefresh(async () => {
      const trips = await refreshTrips({ silent: true });
      if (!active || !trips) return;
      const [, , id, section] = pathname.split('/');
      if (!id || !trips.some(t => String(t._id || t.id) === id)) return;
      const options = { silent: true };
      if (section === 'budget' || section === 'settlements') await Promise.all([loadExpenses(id, options), loadSettlements(id, options)]);
      if (section === 'bookings') await loadBookings(id, options);
      if (section === 'itinerary' || section === 'map') await getItinerary(id, options);
    }, { document, window });
    return () => { active = false; stop(); };
  }, [user, pathname, refreshTrips, loadExpenses, loadSettlements, loadBookings, getItinerary]);
  return null;
}
