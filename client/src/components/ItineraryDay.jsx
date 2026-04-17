import { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, MapPin, DollarSign, X } from 'lucide-react';
import { formatDate, formatBudget, getCategoryIcon } from '../utils/itineraryHelpers.js';
import api from '../api.js';
import toast from 'react-hot-toast';

const ACTIVITY_TYPES = ['activity', 'food', 'accommodation', 'transport', 'sightseeing', 'shopping', 'entertainment'];

const emptyForm = { name: '', type: 'activity', startTime: '', endTime: '', location: '', cost: '', notes: '' };

export default function ItineraryDay({ day, tripId, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [editActivity, setEditActivity] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditActivity(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (act) => { setEditActivity(act); setForm({ name: act.name || '', type: act.type || 'activity', startTime: act.startTime || '', endTime: act.endTime || '', location: act.location || '', cost: act.cost || '', notes: act.notes || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Activity name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, cost: form.cost ? Number(form.cost) : 0 };
      if (editActivity) {
        await api.put(`/trips/${tripId}/days/${day._id}/activities/${editActivity._id}`, payload);
      } else {
        await api.post(`/trips/${tripId}/days/${day._id}/activities`, payload);
      }
      toast.success(editActivity ? 'Activity updated' : 'Activity added');
      setShowModal(false);
      onUpdate && onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save activity');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (actId) => {
    if (!confirm('Delete this activity?')) return;
    try {
      await api.delete(`/trips/${tripId}/days/${day._id}/activities/${actId}`);
      toast.success('Activity deleted');
      onUpdate && onUpdate();
    } catch {
      toast.error('Failed to delete activity');
    }
  };

  return (
    <div className="itinerary-day">
      <div className="day-header">
        <div className="day-label">
          <span className="day-number">Day {day.dayNumber}</span>
          {day.date && <span className="day-date">{formatDate(day.date)}</span>}
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          <Plus size={14} /> Add Activity
        </button>
      </div>

      <div className="activities-list">
        {(!day.activities || day.activities.length === 0) ? (
          <div className="no-activities">No activities yet. Add your first one!</div>
        ) : (
          day.activities.map((act, idx) => (
            <div key={act._id || idx} className="activity-item">
              <span className="activity-icon">{getCategoryIcon(act.type)}</span>
              <div className="activity-details">
                <div className="activity-name">{act.name}</div>
                <div className="activity-meta-row">
                  {(act.startTime || act.endTime) && (
                    <span><Clock size={12} /> {act.startTime}{act.endTime ? ` - ${act.endTime}` : ''}</span>
                  )}
                  {act.location && <span><MapPin size={12} /> {act.location}</span>}
                  {act.cost > 0 && <span className="act-cost"><DollarSign size={12} />{formatBudget(act.cost)}</span>}
                </div>
                {act.notes && <div className="activity-notes">{act.notes}</div>}
              </div>
              <div className="activity-actions">
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(act)} title="Edit"><Edit2 size={13} /></button>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(act._id)} title="Delete"><Trash2 size={13} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editActivity ? 'Edit Activity' : 'Add Activity'}</h2>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Activity Name *</label>
                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Visit Eiffel Tower" />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="input select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Start Time</label>
                  <input className="input" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input className="input" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Address or place name" />
              </div>
              <div className="form-group">
                <label>Cost (USD)</label>
                <input className="input" type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="input textarea" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : (editActivity ? 'Update' : 'Add Activity')}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .itinerary-day { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 1rem; overflow: hidden; }
        .day-header { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1.25rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .day-label { display: flex; align-items: center; gap: 0.75rem; }
        .day-number { font-weight: 700; font-size: 1rem; color: #2563eb; }
        .day-date { font-size: 0.85rem; color: #64748b; }
        .activities-list { padding: 0.75rem 1.25rem; }
        .no-activities { color: #94a3b8; font-size: 0.88rem; text-align: center; padding: 1rem 0; }
        .activity-item { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.6rem 0; border-bottom: 1px solid #f1f5f9; }
        .activity-item:last-child { border-bottom: none; }
        .activity-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 0.1rem; }
        .activity-details { flex: 1; min-width: 0; }
        .activity-name { font-weight: 600; font-size: 0.9rem; color: #1e293b; }
        .activity-meta-row { display: flex; flex-wrap: wrap; gap: 0.6rem; font-size: 0.78rem; color: #64748b; margin-top: 0.2rem; }
        .activity-meta-row span { display: flex; align-items: center; gap: 0.2rem; }
        .act-cost { color: #10b981; font-weight: 600; }
        .activity-notes { font-size: 0.78rem; color: #94a3b8; margin-top: 0.2rem; }
        .activity-actions { display: flex; gap: 0.25rem; flex-shrink: 0; }
        .textarea { resize: vertical; font-family: inherit; }
      `}</style>
    </div>
  );
}
