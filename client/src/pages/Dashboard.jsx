import { useState, useEffect } from 'react';
import { Plus, X, MapPin, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useTripContext } from '../context/TripContext.jsx';
import TripCard from '../components/TripCard.jsx';

const emptyForm = { name: '', destination: '', startDate: '', endDate: '', totalBudget: '', description: '' };

export default function Dashboard() {
  const { user } = useAuth();
  const { trips, loading, fetchTrips, createTrip, updateTrip, deleteTrip } = useTripContext();
  const [showModal, setShowModal] = useState(false);
  const [editTrip, setEditTrip] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Trip name is required';
    if (form.startDate && form.endDate && form.endDate < form.startDate) errs.endDate = 'End date must be after start date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openCreate = () => { setEditTrip(null); setForm(emptyForm); setErrors({}); setShowModal(true); };
  const openEdit = (trip) => {
    setEditTrip(trip);
    setForm({
      name: trip.name || '', destination: trip.destination || '',
      startDate: trip.startDate ? trip.startDate.slice(0, 10) : '',
      endDate: trip.endDate ? trip.endDate.slice(0, 10) : '',
      totalBudget: trip.totalBudget || '', description: trip.description || '',
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const data = { ...form, totalBudget: form.totalBudget ? Number(form.totalBudget) : undefined };
      if (editTrip) { await updateTrip(editTrip._id, data); toast.success('Trip updated!'); }
      else { await createTrip(data); toast.success('Trip created!'); }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save trip');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    try {
      await deleteTrip(id);
      toast.success('Trip deleted');
    } catch {
      toast.error('Failed to delete trip');
    }
  };

  const now = new Date();
  const upcomingTrips = trips.filter((t) => t.startDate && new Date(t.startDate) >= now);
  const totalBudget = trips.reduce((s, t) => s + (Number(t.totalBudget) || 0), 0);

  const StatCard = ({ icon, label, value, color }) => (
    <div className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, borderRadius: '12px', background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
        <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.15rem' }}>{label}</div>
      </div>
    </div>
  );

  return (
    <div className="page" style={{ background: '#f8fafc' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome back, {user?.username || user?.name}! 👋</h1>
            <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Here\'s an overview of your trips</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> New Trip
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon={<MapPin size={22} color="#2563eb" />} label="Total Trips" value={trips.length} color="#2563eb" />
          <StatCard icon={<Calendar size={22} color="#10b981" />} label="Upcoming Trips" value={upcomingTrips.length} color="#10b981" />
          <StatCard icon={<DollarSign size={22} color="#f59e0b" />} label="Total Budget" value={`$${totalBudget.toLocaleString()}`} color="#f59e0b" />
          <StatCard icon={<TrendingUp size={22} color="#7c3aed" />} label="Avg. Budget" value={trips.length ? `$${Math.round(totalBudget / trips.length).toLocaleString()}` : '$0'} color="#7c3aed" />
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>Your Trips</h2>
          <span style={{ color: '#64748b', fontSize: '0.88rem' }}>{trips.length} trip{trips.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card" style={{ height: '160px' }}>
                <div className="skeleton" style={{ height: '100%' }} />
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✈️</div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>No trips yet!</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.92rem' }}>Start planning your first adventure.</p>
            <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Create Your First Trip</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {trips.map((trip) => (
              <TripCard key={trip._id} trip={trip} currentUserId={user?._id} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editTrip ? 'Edit Trip' : 'Create New Trip'}</h2>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Trip Name *</label>
                <input className={`input${errors.name ? ' error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Europe Adventure" />
                {errors.name && <div className="error-msg">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label>Destination</label>
                <input className="input" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="e.g. Paris, France" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Start Date</label>
                  <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input className={`input${errors.endDate ? ' error' : ''}`} type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  {errors.endDate && <div className="error-msg">{errors.endDate}</div>}
                </div>
              </div>
              <div className="form-group">
                <label>Total Budget (USD)</label>
                <input className="input" type="number" min="0" value={form.totalBudget} onChange={(e) => setForm({ ...form, totalBudget: e.target.value })} placeholder="e.g. 3000" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="input textarea" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief trip description..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : (editTrip ? 'Update Trip' : 'Create Trip')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
