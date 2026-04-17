import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Edit2, X, GitFork, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyTemplates, updateTemplate } from '../services/itineraryService.js';
import { formatDate, formatBudget, getAvatarInitials } from '../utils/itineraryHelpers.js';

export default function MyTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ description: '', tags: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyTemplates()
      .then((res) => setTemplates(res.data.itineraries || res.data || []))
      .catch(() => toast.error('Failed to load templates'))
      .finally(() => setLoading(false));
  }, []);

  const handleTogglePublic = async (item) => {
    const newVal = !item.isPublic;
    try {
      await updateTemplate(item._id, { isPublic: newVal });
      setTemplates((prev) => prev.map((t) => t._id === item._id ? { ...t, isPublic: newVal } : t));
      toast.success(newVal ? 'Now public — visible in Browse!' : 'Set to private');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setEditForm({ description: item.description || '', tags: (item.tags || []).join(', ') });
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const tags = editForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
      await updateTemplate(editItem._id, { description: editForm.description, tags });
      setTemplates((prev) => prev.map((t) => t._id === editItem._id ? { ...t, description: editForm.description, tags } : t));
      setEditItem(null);
      toast.success('Template updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', color: '#fff', padding: '2rem 0' }}>
        <div className="container">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>My Templates</h1>
          <p style={{ opacity: 0.85, fontSize: '0.92rem' }}>Manage which of your trips are shared publicly as templates.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        {templates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📋</div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>No templates yet</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.92rem' }}>Make a trip public to share it as a template with the community.</p>
            <Link to="/dashboard" className="btn btn-primary">Go to My Trips</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {templates.map((item) => (
              <div key={item._id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1.02rem', lineHeight: 1.3 }}>{item.title}</h3>
                    <span className={`badge ${item.isPublic ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem', flexShrink: 0 }}>
                      {item.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>

                  {item.destination && (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem' }}>📍 {item.destination}</p>
                  )}
                  {item.description && (
                    <p style={{ fontSize: '0.83rem', color: '#374151', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                      {item.description.length > 100 ? item.description.slice(0, 100) + '...' : item.description}
                    </p>
                  )}
                  {(item.tags || []).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                      {item.tags.map((tag) => <span key={tag} className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{tag}</span>)}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><GitFork size={12} /> {item.forkCount || 0} forks</span>
                    {item.totalBudget > 0 && <span style={{ color: '#10b981', fontWeight: 600 }}>{formatBudget(item.totalBudget)}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.6rem 1.25rem', borderTop: '1px solid #f1f5f9', background: '#fafafa', flexWrap: 'wrap' }}>
                  <button
                    className={`btn btn-sm ${item.isPublic ? 'btn-outline' : 'btn-primary'}`}
                    style={{ fontSize: '0.8rem', flex: 1 }}
                    onClick={() => handleTogglePublic(item)}
                  >
                    {item.isPublic ? <><EyeOff size={12} /> Make Private</> : <><Eye size={12} /> Make Public</>}
                  </button>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(item)} title="Edit template"><Edit2 size={14} /></button>
                  {item.isPublic && (
                    <Link to={`/itineraries/${item._id}`} className="btn btn-ghost btn-sm btn-icon" title="View public page"><ExternalLink size={14} /></Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editItem && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Template: {editItem.title}</h2>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditItem(null)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Description</label>
                <textarea className="input textarea" rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Describe this trip to help others discover it..." />
              </div>
              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input className="input" value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} placeholder="beach, adventure, family, budget..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
