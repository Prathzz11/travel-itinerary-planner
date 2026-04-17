import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, GitFork } from 'lucide-react';
import toast from 'react-hot-toast';
import { forkItinerary } from '../../services/itineraryService.js';
import { formatDate, formatBudget } from '../../utils/itineraryHelpers.js';
import '../../styles/itinerary.css';

export default function ForkModal({ itinerary, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: `${itinerary?.name || ''} (copy)`,
    startDate: '',
    endDate: '',
    totalBudget: itinerary?.totalBudget || '',
  });
  const [errors, setErrors] = useState({});
  const [selectedActivities, setSelectedActivities] = useState(() => {
    const init = {};
    (itinerary?.days || []).forEach((d) => {
      (d.activities || []).forEach((a) => { init[a._id || a.name] = true; });
    });
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [createdTrip, setCreatedTrip] = useState(null);

  const validate1 = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Trip name is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.endDate < form.startDate) errs.endDate = 'End date must be after start date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const toggleActivity = (key) => setSelectedActivities((p) => ({ ...p, [key]: !p[key] }));
  const toggleDay = (day, val) => {
    const updates = {};
    (day.activities || []).forEach((a) => { updates[a._id || a.name] = val; });
    setSelectedActivities((p) => ({ ...p, ...updates }));
  };

  const handleFork = async () => {
    setLoading(true);
    try {
      const filteredDays = (itinerary?.days || []).map((d) => ({
        ...d,
        activities: (d.activities || []).filter((a) => selectedActivities[a._id || a.name]),
      }));
      const payload = {
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
        totalBudget: form.totalBudget ? Number(form.totalBudget) : undefined,
        selectedDays: filteredDays,
      };
      const res = await forkItinerary(itinerary._id, payload);
      setCreatedTrip(res.data.trip || res.data);
      setStep(3);
      toast.success('Trip forked successfully!');
      onSuccess && onSuccess(res.data.trip || res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fork itinerary');
    } finally {
      setLoading(false);
    }
  };

  const days = itinerary?.days || [];
  const totalSelected = Object.values(selectedActivities).filter(Boolean).length;
  const totalActivities = days.reduce((s, d) => s + (d.activities || []).length, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fork-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><GitFork size={18} style={{ marginRight: '0.4rem' }} />Fork Itinerary</h2>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <div className="fork-progress">
            {['Customize', 'Activities', 'Confirm'].map((label, i) => (
              <div key={label} className={`progress-step${step > i + 1 ? ' done' : step === i + 1 ? ' active' : ''}`}>
                <div className="step-circle">{step > i + 1 ? <Check size={14} /> : i + 1}</div>
                <span className="step-label">{label}</span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="fork-step">
              <div className="form-group">
                <label>Trip Name *</label>
                <input className={`input${errors.name ? ' error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="My trip name" />
                {errors.name && <div className="error-msg">{errors.name}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Start Date *</label>
                  <input className={`input${errors.startDate ? ' error' : ''}`} type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  {errors.startDate && <div className="error-msg">{errors.startDate}</div>}
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input className={`input${errors.endDate ? ' error' : ''}`} type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  {errors.endDate && <div className="error-msg">{errors.endDate}</div>}
                </div>
              </div>
              <div className="form-group">
                <label>Total Budget (USD)</label>
                <input className="input" type="number" min="0" value={form.totalBudget} onChange={(e) => setForm({ ...form, totalBudget: e.target.value })} placeholder="Optional" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fork-step" style={{ maxHeight: '360px', overflowY: 'auto' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                Select activities to include ({totalSelected}/{totalActivities} selected)
              </p>
              {days.map((day, di) => {
                const allSelected = (day.activities || []).every((a) => selectedActivities[a._id || a.name]);
                return (
                  <div key={day._id || di} className="activity-select-day">
                    <div className="activity-select-day-header">
                      <span>Day {day.dayNumber || di + 1}</span>
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }} onClick={() => toggleDay(day, !allSelected)}>
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="activity-checkbox-list">
                      {(day.activities || []).map((act, ai) => {
                        const key = act._id || act.name;
                        return (
                          <label key={key} className="activity-checkbox-item">
                            <input type="checkbox" checked={!!selectedActivities[key]} onChange={() => toggleActivity(key)} />
                            <span>{act.name}</span>
                            {act.cost > 0 && <span style={{ marginLeft: 'auto', color: '#10b981', fontSize: '0.78rem', fontWeight: 600 }}>{formatBudget(act.cost)}</span>}
                          </label>
                        );
                      })}
                      {(!day.activities || day.activities.length === 0) && (
                        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>No activities in this day</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="fork-step">
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Trip Forked!</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Your new trip has been created successfully.</p>
              </div>
              <div className="fork-summary">
                <div className="fork-summary-row"><span>Trip Name</span><span>{form.name}</span></div>
                <div className="fork-summary-row"><span>Start Date</span><span>{form.startDate ? formatDate(form.startDate) : '–'}</span></div>
                <div className="fork-summary-row"><span>End Date</span><span>{form.endDate ? formatDate(form.endDate) : '–'}</span></div>
                {form.totalBudget && <div className="fork-summary-row"><span>Budget</span><span>{formatBudget(Number(form.totalBudget))}</span></div>}
                <div className="fork-summary-row"><span>Activities</span><span>{totalSelected} activities</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step < 3 && <button className="btn btn-ghost" onClick={onClose}>Cancel</button>}
          {step === 2 && <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>}
          {step === 3 && (
            <>
              <button className="btn btn-ghost" onClick={onClose}>Close</button>
              {createdTrip && (
                <button className="btn btn-primary" onClick={() => { onClose(); navigate(`/trips/${createdTrip._id}`); }}>
                  View Trip
                </button>
              )}
            </>
          )}
          {step === 1 && <button className="btn btn-primary" onClick={() => { if (validate1()) setStep(2); }}>Next</button>}
          {step === 2 && (
            <button className="btn btn-primary" onClick={handleFork} disabled={loading}>
              {loading ? 'Forking...' : 'Fork Trip'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
