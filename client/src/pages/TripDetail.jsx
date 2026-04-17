import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Edit2, Trash2, X, Plus, LayoutDashboard, BookOpen, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import CollabAvatars from '../components/CollabAvatars.jsx';
import { formatDate, formatBudget } from '../utils/itineraryHelpers.js';

export default function TripDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const fetchTrip = async () => {
    try {
      const res = await api.get(`/trips/${id}`);
      setTrip(res.data.trip || res.data);
    } catch {
      toast.error('Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrip(); }, [id]);

  const isOwner = trip && (trip.createdBy === user?._id || trip.createdBy?._id === user?._id);

  const openEdit = () => {
    setEditForm({
      name: trip.title || '', destination: trip.destination || '',
      startDate: trip.startDate ? trip.startDate.slice(0, 10) : '',
      endDate: trip.endDate ? trip.endDate.slice(0, 10) : '',
      totalBudget: trip.budget?.total || '', description: trip.description || '',
    });
    setShowEdit(true);
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/trips/${id}`, { ...editForm, totalBudget: editForm.totalBudget ? Number(editForm.totalBudget) : undefined });
      setTrip(res.data.trip || res.data);
      setShowEdit(false);
      toast.success('Trip updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this trip? This cannot be undone.')) return;
    try {
      await api.delete(`/trips/${id}`);
      toast.success('Trip deleted');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete trip');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api.post(`/trips/${id}/invite`, { email: inviteEmail });
      toast.success('Invitation sent!');
      setInviteEmail('');
      fetchTrip();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!trip) return <div className="container" style={{ padding: '2rem' }}><p>Trip not found.</p></div>;

  const members = trip.members || [];

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', color: '#fff', padding: '2rem 0' }}>
        <div className="container">
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', marginBottom: '1rem', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>{trip.title}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.88rem', opacity: 0.9 }}>
                {trip.destination && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} />{trip.destination}</span>}
                {trip.startDate && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} />{formatDate(trip.startDate)}{trip.endDate ? ` – ${formatDate(trip.endDate)}` : ''}</span>}
                {trip.budget?.total && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><DollarSign size={14} />{formatBudget(trip.budget?.total)}</span>}
                {members.length > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={14} />{members.length} member{members.length !== 1 ? 's' : ''} <CollabAvatars members={members} size={24} /></span>}
              </div>
            </div>
            {isOwner && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-ghost btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} onClick={openEdit}><Edit2 size={14} /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}><Trash2 size={14} /> Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="tabs">
          {['overview', 'itinerary', 'budget', 'members'].map((tab) => (
            <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div>
            {trip.description && <div className="card card-body" style={{ marginBottom: '1rem' }}><p style={{ color: '#374151', lineHeight: 1.7 }}>{trip.description}</p></div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="card card-body">
                <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Destination</div>
                <div style={{ fontWeight: 700 }}>{trip.destination || 'Not set'}</div>
              </div>
              <div className="card card-body">
                <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Dates</div>
                <div style={{ fontWeight: 700 }}>{trip.startDate ? `${formatDate(trip.startDate)} – ${trip.endDate ? formatDate(trip.endDate) : '?'}` : 'Not set'}</div>
              </div>
              <div className="card card-body">
                <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Budget</div>
                <div style={{ fontWeight: 700, color: '#10b981' }}>{trip.budget?.total ? formatBudget(trip.budget?.total) : 'Not set'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to={`/trips/${id}/itinerary`} className="btn btn-primary"><LayoutDashboard size={15} /> View Full Itinerary</Link>
              <Link to={`/trips/${id}/budget`} className="btn btn-outline"><DollarSign size={15} /> Manage Budget</Link>
            </div>
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div>
            <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.92rem' }}>View and manage day-by-day activities for this trip.</p>
            <Link to={`/trips/${id}/itinerary`} className="btn btn-primary"><BookOpen size={15} /> Open Itinerary Editor</Link>
          </div>
        )}

        {activeTab === 'budget' && (
          <div>
            <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.92rem' }}>Track expenses and manage your trip budget.</p>
            <Link to={`/trips/${id}/budget`} className="btn btn-primary"><DollarSign size={15} /> Open Budget Manager</Link>
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            {isOwner && (
              <form onSubmit={handleInvite} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input className="input" style={{ paddingLeft: '2.25rem' }} type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Invite by email address" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={inviting}><Plus size={14} /> {inviting ? 'Inviting...' : 'Invite'}</button>
              </form>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {members.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No members yet. Invite people to collaborate!</p>
              ) : members.map((m, i) => {
                const name = m.username || m.name || m.email || '';
                const isOwnerMember = trip.createdBy === m._id || trip.createdBy?._id === m._id;
                return (
                  <div key={m._id || i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dbeafe', color: '#2563eb', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {name ? (name[0]).toUpperCase() : '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{name}</div>
                      {m.email && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{m.email}</div>}
                    </div>
                    {isOwnerMember && <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>Owner</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Trip</h2>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowEdit(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              {['name', 'destination'].map((f) => (
                <div key={f} className="form-group">
                  <label>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                  <input className="input" value={editForm[f] || ''} onChange={(e) => setEditForm({ ...editForm, [f]: e.target.value })} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group"><label>Start Date</label><input className="input" type="date" value={editForm.startDate || ''} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} /></div>
                <div className="form-group"><label>End Date</label><input className="input" type="date" value={editForm.endDate || ''} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Total Budget</label><input className="input" type="number" value={editForm.totalBudget || ''} onChange={(e) => setEditForm({ ...editForm, totalBudget: e.target.value })} /></div>
              <div className="form-group"><label>Description</label><textarea className="input textarea" rows={2} value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
