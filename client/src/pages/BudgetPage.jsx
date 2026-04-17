import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api.js';
import BudgetTracker from '../components/BudgetTracker.jsx';
import { formatBudget, formatDate } from '../utils/itineraryHelpers.js';

const CATEGORIES = ['accommodation', 'food', 'transport', 'activity', 'shopping', 'entertainment', 'other'];
const emptyForm = { name: '', amount: '', category: 'other', date: new Date().toISOString().slice(0, 10), notes: '' };

export default function BudgetPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [tripRes, expRes] = await Promise.all([
        api.get(`/trips/${id}`),
        api.get(`/trips/${id}/expenses`).catch(() => ({ data: [] })),
      ]);
      setTrip(tripRes.data.trip || tripRes.data);
      setExpenses(expRes.data.expenses || expRes.data || []);
    } catch {
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.name = 'Name is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await api.post(`/trips/${id}/expenses`, { ...form, amount: Number(form.amount) });
      setExpenses((prev) => [res.data.expense || res.data, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
      toast.success('Expense added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expId) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api.delete(`/trips/${id}/expenses/${expId}`);
      setExpenses((prev) => prev.filter((e) => e._id !== expId));
      toast.success('Expense deleted');
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const totalBudget = trip?.totalBudget || 0;
  const spent = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const remaining = totalBudget - spent;

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', color: '#fff', padding: '1.5rem 0' }}>
        <div className="container">
          <Link to={`/trips/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: '0.75rem' }}>
            <ArrowLeft size={14} /> Back to Trip
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{trip?.name} — Budget</h1>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', fontSize: '0.88rem', opacity: 0.9 }}>
            <span>Budget: {formatBudget(totalBudget)}</span>
            <span>Spent: {formatBudget(spent)}</span>
            <span style={{ color: remaining < 0 ? '#fca5a5' : '#86efac' }}>Remaining: {formatBudget(remaining)}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <BudgetTracker totalBudget={totalBudget} expenses={expenses} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 700 }}>Expenses ({expenses.length})</h2>
          <button className="btn btn-primary btn-sm" onClick={() => { setForm(emptyForm); setErrors({}); setShowForm(true); }}>
            <Plus size={14} /> Add Expense
          </button>
        </div>

        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💸</div>
            <h3 style={{ marginBottom: '0.4rem' }}>No expenses yet</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Start tracking your trip expenses.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}><Plus size={14} /> Add First Expense</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {expenses.map((exp, idx) => (
              <div key={exp._id || idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '0.75rem 1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{exp.name}</div>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>{exp.category || 'other'}</span>
                    {exp.date && <span>{formatDate(exp.date)}</span>}
                    {exp.notes && <span>{exp.notes}</span>}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.98rem', flexShrink: 0 }}>{formatBudget(exp.amount)}</div>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleDelete(exp._id)} title="Delete"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Expense</h2>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Expense Name *</label>
                <input className={`input${errors.name ? ' error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Hotel Breakfast" />
                {errors.name && <div className="error-msg">{errors.name}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Amount (USD) *</label>
                  <input className={`input${errors.amount ? ' error' : ''}`} type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                  {errors.amount && <div className="error-msg">{errors.amount}</div>}
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="input select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Adding...' : 'Add Expense'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
