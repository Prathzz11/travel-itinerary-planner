import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, GitFork } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPublicItinerary } from '../services/itineraryService.js';
import ForkModal from '../components/browse/ForkModal.jsx';
import { formatDate, formatBudget, formatDuration, getAvatarInitials } from '../utils/itineraryHelpers.js';
import RatingsDisplay from '../components/browse/RatingsDisplay.jsx';

export default function ForkItinerary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicItinerary(id)
      .then((res) => setItinerary(res.data.itinerary || res.data))
      .catch(() => toast.error('Failed to load itinerary'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSuccess = (newTrip) => {
    toast.success('Trip forked successfully! Redirecting to your dashboard...');
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!itinerary) return (
    <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
      <h2>Itinerary not found</h2>
      <Link to="/browse" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}><ArrowLeft size={14} /> Back to Browse</Link>
    </div>
  );

  const creator = itinerary.createdBy || itinerary.createdBy || {};
  const creatorName = creator.username || creator.name || 'Unknown';
  const days = itinerary.days || [];

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 64px)', padding: '2rem 0' }}>
      <div className="container">
        <Link to={`/itineraries/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb', fontSize: '0.88rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Back to Itinerary
        </Link>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitFork size={22} color="#2563eb" /> Fork Itinerary
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Source info */}
          <div>
            <div className="card card-body" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.1rem' }}>Source Itinerary</h3>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>{itinerary.name}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: '#64748b', marginBottom: '0.75rem' }}>
                {itinerary.destination && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} />{itinerary.destination}</span>}
                {itinerary.startDate && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={13} />{formatDate(itinerary.startDate)}{itinerary.endDate ? ` – ${formatDate(itinerary.endDate)}` : ''} · {formatDuration(itinerary.startDate, itinerary.endDate)}</span>}
                {itinerary.budget?.total > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 600 }}><DollarSign size={13} />{formatBudget(itinerary.budget?.total, itinerary.budget?.currency)}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dbeafe', color: '#2563eb', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getAvatarInitials(creatorName)}</div>
                <span style={{ fontSize: '0.88rem', color: '#374151' }}>{creatorName}</span>
              </div>
              <RatingsDisplay rating={itinerary.averageRating || 0} reviewCount={itinerary.reviewCount || 0} size="sm" />
            </div>

            <div className="card card-body">
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Itinerary Preview</h3>
              {days.slice(0, 3).map((day, di) => (
                <div key={day._id || di} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.88rem', marginBottom: '0.35rem' }}>Day {day.dayNumber || di + 1}{day.date ? ` · ${formatDate(day.date)}` : ''}</div>
                  {(day.activities || []).slice(0, 3).map((act, ai) => (
                    <div key={act._id || ai} style={{ fontSize: '0.82rem', color: '#374151', padding: '0.2rem 0', paddingLeft: '0.75rem', borderLeft: '2px solid #dbeafe' }}>
                      {act.name}
                    </div>
                  ))}
                </div>
              ))}
              {days.length > 3 && <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>+{days.length - 3} more days</p>}
            </div>
          </div>

          {/* Fork form */}
          <div>
            <ForkModal itinerary={itinerary} onClose={() => navigate(`/itineraries/${id}`)} onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}
