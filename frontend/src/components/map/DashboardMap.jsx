import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Compass } from 'lucide-react';
import { formatTripDates, getTripDuration } from '../../utils/formatters';

const containerStyle = { width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' };

// Default to a world view if no trips
const defaultCenter = { lat: 20, lng: 0 }; 
const defaultZoom = 2;

// In-memory cache for geocoding to prevent hitting API limits
const geocodeCache = new Map();

const DashboardMap = ({ trips = [] }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    libraries: ['places']
  });

  const [map, setMap] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [geocodedTrips, setGeocodedTrips] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Geocode all trips that have destinations
  useEffect(() => {
    if (!isLoaded || !trips.length) {
      setGeocodedTrips([]);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    let isMounted = true;
    
    const geocodeAll = async () => {
      setIsGeocoding(true);
      const results = [];
      
      for (const trip of trips) {
        if (!trip.destination) continue;
        
        // Check cache first
        if (geocodeCache.has(trip.destination)) {
          results.push({ ...trip, ...geocodeCache.get(trip.destination) });
          continue;
        }
        
        try {
          // Add a small delay to avoid OVER_QUERY_LIMIT if there are many trips
          await new Promise(resolve => setTimeout(resolve, 250));
          
          const response = await new Promise((resolve, reject) => {
            geocoder.geocode({ address: trip.destination }, (res, status) => {
              if (status === 'OK' && res[0]) resolve(res[0]);
              else reject(status);
            });
          });
          
          const coords = {
            lat: response.geometry.location.lat(),
            lng: response.geometry.location.lng()
          };
          
          geocodeCache.set(trip.destination, coords);
          results.push({ ...trip, ...coords });
        } catch (error) {
          console.warn(`Geocoding failed for ${trip.destination}:`, error);
        }
      }
      
      if (isMounted) {
        setGeocodedTrips(results);
        setIsGeocoding(false);
      }
    };

    geocodeAll();

    return () => { isMounted = false; };
  }, [trips, isLoaded]);

  // Fit bounds when markers change
  const fitBounds = useCallback((mapInstance, points) => {
    if (!mapInstance || points.length === 0) return;
    
    // If only one point, just center and zoom
    if (points.length === 1) {
      mapInstance.setCenter({ lat: points[0].lat, lng: points[0].lng });
      mapInstance.setZoom(10);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    points.forEach(p => {
      bounds.extend({ lat: p.lat, lng: p.lng });
    });
    mapInstance.fitBounds(bounds);
    
    // Prevent zooming in too close
    const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
      if (mapInstance.getZoom() > 14) mapInstance.setZoom(14);
      window.google.maps.event.removeListener(listener);
    });
  }, []);

  useEffect(() => {
    if (map && geocodedTrips.length > 0) {
      fitBounds(map, geocodedTrips);
    } else if (map && geocodedTrips.length === 0) {
      map.setCenter(defaultCenter);
      map.setZoom(defaultZoom);
    }
  }, [map, geocodedTrips, fitBounds]);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) return <div className="card p-4 text-center border-danger text-danger bg-danger bg-opacity-10 mb-4"><div className="fw-bold">Error loading Google Maps</div><div className="small">Please check your API key configuration.</div></div>;
  if (!isLoaded) return <div className="card p-5 text-center text-muted mb-4 placeholder-glow" style={{ height: '400px' }}><div className="spinner-border text-primary mb-3" /><div>Initializing Map Engine...</div></div>;

  return (
    <div className="card mb-4 position-relative animate-fade-in" style={{ height: '450px', overflow: 'hidden' }}>
      {!apiKey && (
        <div style={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 10, background: 'rgba(245, 158, 11, 0.9)', color: 'white', padding: '8px 12px', borderRadius: '4px', fontSize: '0.85rem', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
          <strong>Missing API Key:</strong> Map is running in development mode. Add VITE_GOOGLE_MAPS_API_KEY to .env to remove watermark.
        </div>
      )}
      
      {isGeocoding && (
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, background: 'rgba(15, 23, 42, 0.8)', color: 'white', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(4px)' }}>
          <div className="spinner-border spinner-border-sm text-primary" role="status" /> Mapping destinations...
        </div>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={defaultZoom}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
            { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
            { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
          ]
        }}
      >
        {geocodedTrips.map((trip) => (
          <Marker
            key={trip._id || trip.id}
            position={{ lat: trip.lat, lng: trip.lng }}
            onClick={() => setSelectedTrip(trip)}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: 'var(--color-primary)',
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 10
            }}
          />
        ))}

        {selectedTrip && (
          <InfoWindow
            position={{ lat: selectedTrip.lat, lng: selectedTrip.lng }}
            onCloseClick={() => setSelectedTrip(null)}
          >
            <div style={{ padding: '8px', color: '#333', maxWidth: '240px' }}>
              {selectedTrip.image && (
                <div style={{ width: '100%', height: '80px', marginBottom: '10px', borderRadius: '4px', overflow: 'hidden' }}>
                  <img src={selectedTrip.image} alt={selectedTrip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#111', fontWeight: 'bold' }}>{selectedTrip.title}</h3>
              
              <div style={{ fontSize: '0.85rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="var(--color-primary)" /> {selectedTrip.destination}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="var(--color-primary)" /> {formatTripDates(selectedTrip.startDate, selectedTrip.endDate)}
                </div>
                {selectedTrip.startDate && selectedTrip.endDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} color="var(--color-primary)" /> {getTripDuration(selectedTrip.startDate, selectedTrip.endDate)}
                  </div>
                )}
              </div>
              
              <Link to={`/trip/${selectedTrip._id || selectedTrip.id}`} className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2">
                <Compass size={14} /> View Trip
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default React.memo(DashboardMap);
