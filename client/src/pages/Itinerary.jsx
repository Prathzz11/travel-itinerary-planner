import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api.js';
import ItineraryDay from '../components/ItineraryDay.jsx';

export default function Itinerary() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDays = useCallback(async () => {
    try {
      const [tripRes, daysRes] = await Promise.all([
        api.get(`/trips/${id}`),
        api.get(`/trips/${id}/days`),
      ]);
      setTrip(tripRes.data.trip || tripRes.data);
      const raw = daysRes.data.days || daysRes.data || [];
      setDays(raw.sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0)));
    } catch {
      toast.error('Failed to load itinerary');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDays(); }, [fetchDays]);

  const handleAddDay = async () => {
    try {
      const nextDay = days.length + 1;
      const res = await api.post(`/trips/${id}/days`, { dayNumber: nextDay });
      setDays((prev) => [...prev, res.data.day || res.data]);
      toast.success(`Day ${nextDay} added`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add day');
    }
  };

  const handleDeleteDay = async (dayId, dayNum) => {
    if (!confirm(`Delete Day ${dayNum} and all its activities?`)) return;
    try {
      await api.delete(`/trips/${id}/days/${dayId}`);
      setDays((prev) => prev.filter((d) => d._id !== dayId));
      toast.success('Day deleted');
    } catch {
      toast.error('Failed to delete day');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', color: '#fff', padding: '1.5rem 0' }}>
        <div className="container">
          <Link to={`/trips/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: '0.75rem' }}>
            <ArrowLeft size={14} /> Back to Trip
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{trip?.name} — Itinerary</h1>
          {trip?.destination && <p style={{ opacity: 0.85, fontSize: '0.9rem', marginTop: '0.25rem' }}>{trip.destination}</p>}
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        {days.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📅</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No days yet</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Add your first day to start building your itinerary.</p>
            <button className="btn btn-primary" onClick={handleAddDay}><Plus size={15} /> Add First Day</button>
          </div>
        ) : (
          <>
            {days.map((day) => (
              <div key={day._id} style={{ position: 'relative' }}>
                <ItineraryDay day={day} tripId={id} onUpdate={fetchDays} />
                <button
                  className="btn btn-danger btn-sm"
                  style={{ position: 'absolute', top: '0.85rem', right: '5rem' }}
                  onClick={() => handleDeleteDay(day._id, day.dayNumber)}
                  title="Delete day"
                >
                  <Trash2 size={13} /> Delete Day
                </button>
              </div>
            ))}
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} onClick={handleAddDay}>
              <Plus size={15} /> Add Day {days.length + 1}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
