import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { getPublicItineraries } from '../services/itineraryService';

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const userId = id || user?.id;
  const [profile, setProfile] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    Promise.all([api.get(`/auth/users/${userId}`), getPublicItineraries({ author: userId, limit: 100 })])
      .then(([person, trips]) => { if (active) { setProfile(person.data); setTemplates(trips.data.templates); } })
      .catch(err => { if (active) setError(err.userMessage || 'Could not load profile'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);
  if (loading) return <div className="page-container">Loading profile...</div>;
  if (error) return <div className="page-container" role="alert">{error}</div>;
  return <div className="page-container">
    <div className="card card-body mb-4"><h1>{profile.name}</h1><p>{profile.bio || 'Traveler and itinerary creator.'}</p>{!id && <Link className="btn btn-outline-primary align-self-start" to="/settings">Edit Profile</Link>}</div>
    <h2>Published itineraries</h2>
    {!templates.length && <p>No published itineraries yet. Set a trip's visibility to Public to publish its itinerary.</p>}
    <div className="row g-3">{templates.map(trip => <div key={trip._id} className="col-md-4"><div className="card card-body"><h3 className="h5">{trip.title}</h3><p>{trip.destination} · {trip.duration} days</p><Link className="btn btn-primary" to={`/itinerary/${trip._id}`}>View Itinerary</Link></div></div>)}</div>
  </div>;
}
