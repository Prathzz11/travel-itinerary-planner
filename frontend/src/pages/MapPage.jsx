import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Layers, Calendar } from 'lucide-react';
import { useTrip } from '../hooks/useTrip';
import { ItineraryContext } from '../contexts/ItineraryContext';
import TripNav from '../components/trip/TripNav';
import InteractiveMap from '../components/map/InteractiveMap';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const LIBRARIES = ['places', 'geometry'];

const MapPage = () => {
  const { id } = useParams();
  const { trips } = useTrip();
  const { getItinerary, itineraryCache } = useContext(ItineraryContext);

  const trip = trips?.find(t => (t._id || t.id) === id);

  const [itineraryDoc, setItineraryDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('all');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getItinerary(id).then(doc => {
      setItineraryDoc(doc);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id, getItinerary]);

  useEffect(() => {
    if (itineraryCache[id]) setItineraryDoc(itineraryCache[id]);
  }, [itineraryCache, id]);

  const itineraryDays = itineraryDoc?.days || [];

  // Gather activities based on selected day filter
  const activitiesToShow = selectedDay === 'all'
    ? itineraryDays.flatMap((day, dayIdx) =>
        day.activities.map(act => ({
          ...act,
          id: act._id || act.id,
          title: act.name || act.title,
          dayLabel: `Day ${dayIdx + 1} — ${day.date}`
        }))
      )
    : (() => {
        const day = itineraryDays[parseInt(selectedDay)];
        return (day?.activities || []).map(act => ({
          ...act,
          id: act._id || act.id,
          title: act.name || act.title,
          dayLabel: `Day ${parseInt(selectedDay) + 1} — ${day.date}`
        }));
      })();

  const hasLocations = activitiesToShow.some(a => a.location);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="page-container">
      <TripNav tripId={id} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--color-text)' }}>
            <MapPin size={22} className="me-2" style={{ color: 'var(--color-primary)' }} />
            Trip Map
          </h1>
          <p className="text-muted mb-0">
            {trip?.destination && <><span style={{ color: 'var(--color-primary)' }}>{trip.destination}</span> · </>}
            Visualize your itinerary stops
          </p>
        </div>

        {/* Day filter */}
        {itineraryDays.length > 0 && (
          <div className="d-flex align-items-center gap-2">
            <Layers size={16} className="text-muted" />
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto', minWidth: 160 }}
              value={selectedDay}
              onChange={e => setSelectedDay(e.target.value)}
            >
              <option value="all">All Days</option>
              {itineraryDays.map((day, idx) => (
                <option key={day.date} value={String(idx)}>
                  Day {idx + 1} — {day.date}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Map or empty state */}
      {itineraryDays.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No itinerary yet"
          message="Add days and activities in the Flight Plan tab to see them on the map."
        />
      ) : !hasLocations ? (
        <EmptyState
          icon={MapPin}
          title="No mappable locations"
          message="Add location details to your activities in the Flight Plan tab to see them plotted here."
        />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ height: '70vh' }}>
            <InteractiveMap activities={activitiesToShow} />
          </div>

          {/* Activity legend below the map */}
          <div className="card-footer d-flex flex-wrap gap-2 align-items-center" style={{ background: 'var(--color-surface)' }}>
            <span className="text-muted small me-2">
              <strong>{activitiesToShow.filter(a => a.location).length}</strong> stops mapped
            </span>
            {activitiesToShow.filter(a => a.location).map((act, idx) => (
              <span
                key={act.id || idx}
                className="badge"
                style={{
                  background: 'rgba(99,102,241,0.15)',
                  color: 'var(--color-primary)',
                  fontWeight: 500,
                  fontSize: '0.78rem'
                }}
              >
                <MapPin size={10} className="me-1" />
                {act.title || act.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
