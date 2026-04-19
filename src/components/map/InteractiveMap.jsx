import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { MapPin, Clock, DollarSign, Image as ImageIcon } from 'lucide-react';

const CATEGORY_COLORS = {
  'Accommodation': '#8b5cf6',
  'Food': '#ec4899',
  'Transport': '#3b82f6',
  'Sightseeing': '#f59e0b',
  'Entertainment': '#10b981',
  'Dining': '#ec4899',
  'Shopping': '#f59e0b',
  'Sports': '#10b981',
  'Other': '#64748b'
};

const defaultCenter = { lat: 35.6762, lng: 139.6503 }; // Tokyo
const containerStyle = { width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' };

const InteractiveMap = ({ activities = [] }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '', // will show dev watermark if empty
    libraries: ['places']
  });

  const [map, setMap] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [directions, setDirections] = useState(null);

  // Filter activities that actually have lat/lng
  const validActivities = useMemo(() => {
    return activities.filter(a => a.lat && a.lng);
  }, [activities]);

  // Fit bounds to all markers when map loads or activities change
  const fitBounds = useCallback((mapInstance, points) => {
    if (!mapInstance || points.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    points.forEach(p => {
      bounds.extend({ lat: p.lat, lng: p.lng });
    });
    mapInstance.fitBounds(bounds);
    
    // Prevent zooming in too close if there's only 1 marker
    const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
      if (mapInstance.getZoom() > 16) mapInstance.setZoom(16);
      window.google.maps.event.removeListener(listener);
    });
  }, []);

  useEffect(() => {
    if (map && validActivities.length > 0) {
      fitBounds(map, validActivities);
    }
  }, [map, validActivities, fitBounds]);

  // Calculate route between activities if there are more than 1
  useEffect(() => {
    if (!isLoaded || validActivities.length < 2) {
      setDirections(null);
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    const sorted = [...validActivities].sort((a, b) => a.time.localeCompare(b.time));
    
    const origin = { lat: sorted[0].lat, lng: sorted[0].lng };
    const destination = { lat: sorted[sorted.length - 1].lat, lng: sorted[sorted.length - 1].lng };
    
    const waypoints = sorted.slice(1, -1).map(act => ({
      location: { lat: act.lat, lng: act.lng },
      stopover: true
    }));

    directionsService.route({
      origin,
      destination,
      waypoints,
      travelMode: window.google.maps.TravelMode.TRANSIT // Default to transit for cities
    }, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        setDirections(result);
      } else {
        console.warn(`Directions request failed due to ${status}`);
        // Fallback to driving if transit fails
        if (status === 'ZERO_RESULTS') {
          directionsService.route({
            origin, destination, waypoints, travelMode: window.google.maps.TravelMode.DRIVING
          }, (fallbackResult, fallbackStatus) => {
            if (fallbackStatus === 'OK') setDirections(fallbackResult);
          });
        }
      }
    });
  }, [isLoaded, validActivities]);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) return <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', borderRadius: 'var(--radius-lg)' }}>Error loading Google Maps. Check your API key.</div>;
  if (!isLoaded) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading Map...</div>;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
      
      {!apiKey && (
        <div style={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 10, background: 'rgba(245, 158, 11, 0.9)', color: 'white', padding: '8px 12px', borderRadius: '4px', fontSize: '0.85rem', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
          <strong>Missing API Key:</strong> Map is running in development mode. Add VITE_GOOGLE_MAPS_API_KEY to .env to remove watermark and enable routing.
        </div>
      )}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
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
          ] // Dark mode styles
        }}
      >
        {/* Only render raw markers if we don't have directions (directions renderer draws its own markers, but we want custom ones) */}
        {!directions && validActivities.map((act) => (
          <Marker
            key={act.id}
            position={{ lat: act.lat, lng: act.lng }}
            onClick={() => setSelectedActivity(act)}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: CATEGORY_COLORS[act.category] || '#ccc',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 8
            }}
          />
        ))}

        {/* If we have directions, render the route line. We suppress directions markers to draw our own custom ones over them */}
        {directions && (
          <>
            <DirectionsRenderer 
              directions={directions} 
              options={{ 
                suppressMarkers: true,
                polylineOptions: { strokeColor: 'var(--color-primary)', strokeWeight: 4, strokeOpacity: 0.8 } 
              }} 
            />
            {/* Re-draw our custom markers on top of the route */}
            {validActivities.map((act) => (
              <Marker
                key={act.id}
                position={{ lat: act.lat, lng: act.lng }}
                onClick={() => setSelectedActivity(act)}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  fillColor: CATEGORY_COLORS[act.category] || '#ccc',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  scale: 8
                }}
              />
            ))}
          </>
        )}

        {selectedActivity && (
          <InfoWindow
            position={{ lat: selectedActivity.lat, lng: selectedActivity.lng }}
            onCloseClick={() => setSelectedActivity(null)}
          >
            <div style={{ padding: '8px', color: '#333', maxWidth: '200px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#111' }}>{selectedActivity.title}</h3>
              
              <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} /> {selectedActivity.time} ({selectedActivity.duration})
                </div>
                {selectedActivity.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> {selectedActivity.location}
                  </div>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default React.memo(InteractiveMap);
