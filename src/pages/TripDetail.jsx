import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Calendar, Users, Activity, Edit2, Trash2, Clock, IndianRupee, X, Globe, Lock } from 'lucide-react';
import { useTrip } from '../hooks/useTrip';
import { ExploreContext } from '../contexts/ExploreContext';
import TripNav from '../components/trip/TripNav';
import { formatTripDates } from '../utils/formatters';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { trips, deleteTrip, updateTrip } = useTrip();
  const { publishTrip } = React.useContext(ExploreContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const trip = trips?.find(t => (t._id || t.id) === id);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [id]);
  React.useEffect(() => {
    if (location.state?.autoEdit && trip) { 
      const formattedTrip = {
        ...trip,
        startDate: trip.startDate ? trip.startDate.split('T')[0] : '',
        endDate: trip.endDate ? trip.endDate.split('T')[0] : ''
      };
      setEditForm(formattedTrip); 
      setIsEditing(true); 
      navigate(location.pathname, { replace: true, state: {} }); 
    }
  }, [location.state?.autoEdit, trip, navigate, location.pathname]);

  if (isLoading) {
    return <div className="page-container d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}><div className="text-center"><LoadingSpinner size={48} /><p className="text-muted mt-3">Loading trip details...</p></div></div>;
  }
  if (!trip) { return <div className="page-container"><div className="card text-center py-5"><h2>Trip not found</h2></div></div>; }

  const handleEditClick = () => { 
    setEditForm({
      ...trip,
      startDate: trip.startDate ? trip.startDate.split('T')[0] : '',
      endDate: trip.endDate ? trip.endDate.split('T')[0] : ''
    }); 
    setIsEditing(true); 
  };
  const handleSaveEdit = (e) => {
    e.preventDefault();
    const processedForm = { ...editForm };
    if (typeof processedForm.tags === 'string') processedForm.tags = processedForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    updateTrip(id, processedForm);
    if (processedForm.visibility === 'public' && trip.visibility !== 'public') {
      publishTrip({ id: trip._id || trip.id, title: processedForm.title, destination: processedForm.destination, author: { id: 'u1', name: 'Current User', avatar: 'https://i.pravatar.cc/150?u=u1' }, image: trip.image, budget: processedForm.budget, currency: trip.currency, durationDays: 7, difficulty: processedForm.difficulty || 'Moderate', tags: processedForm.tags || [], description: processedForm.description || '' });
    }
    setIsEditing(false);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Hero */}
        <div className="position-relative" style={{ height: 300 }}>
          <img src={trip.image} alt={trip.destination} className="w-100 h-100" style={{ objectFit: 'cover' }} />
          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(0,0,0,0.4) 100%)' }} />
          
          <div className="position-absolute top-0 end-0 m-3 d-flex gap-2">
            <button className="btn btn-sm btn-outline-light d-flex align-items-center gap-1" onClick={handleEditClick}><Edit2 size={14} /> Edit</button>
            <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" onClick={() => setConfirmDelete(true)}><Trash2 size={14} /> Delete</button>
          </div>

          <div className="position-absolute bottom-0 start-0 end-0 p-4">
            <div className="d-flex justify-content-between align-items-end">
              <div>
                <span className="badge bg-primary text-uppercase mb-2">{trip.status}</span>
                <h1 className="display-6 fw-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{trip.title}</h1>
                <div className="d-flex flex-wrap gap-4 mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  <span className="d-flex align-items-center gap-1"><MapPin size={16} /> {trip.destination}</span>
                  <span className="d-flex align-items-center gap-1"><Calendar size={16} /> {formatTripDates(trip.startDate, trip.endDate)}</span>
                </div>
                <span className={`badge d-inline-flex align-items-center gap-1 ${trip.visibility === 'public' ? 'bg-success' : 'bg-secondary'}`}>
                  {trip.visibility === 'public' ? <><Globe size={12} /> Public</> : <><Lock size={12} /> Private</>}
                </span>
              </div>
              <div className="text-end text-muted small d-none d-md-block">
                <div className="d-flex align-items-center gap-1 justify-content-end"><Clock size={12} /> Created: {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'Unknown'}</div>
                {trip.updatedAt && <div className="mt-1">Last modified: {new Date(trip.updatedAt).toLocaleDateString()}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-4">
          <TripNav tripId={trip._id || trip.id} />
          
          {/* Overview Grid */}
          <div className="row g-4">
            <div className="col-md-6">
              <h3 className="fs-5 mb-3">Trip Statistics</h3>
              <div className="row g-3">
                <div className="col-4"><div className="card text-center py-3"><Activity size={24} color="var(--color-primary)" className="mx-auto mb-2" /><div className="fs-4 fw-bold">{trip.activitiesCount || 0}</div><div className="text-muted small">Activities</div></div></div>
                <div className="col-4"><div className="card text-center py-3"><Users size={24} color="var(--color-secondary)" className="mx-auto mb-2" /><div className="fs-4 fw-bold">{trip.members?.length || 1}</div><div className="text-muted small">Members</div></div></div>
                <div className="col-4"><div className="card text-center py-3"><IndianRupee size={24} color="var(--color-success)" className="mx-auto mb-2" /><div className="fs-6 fw-bold">{trip.budget ? `${trip.budget.toLocaleString()} ${trip.currency || 'INR'}` : 'N/A'}</div><div className="text-muted small">Budget</div></div></div>
              </div>
            </div>
            <div className="col-md-6">
              <h3 className="fs-5 mb-3 d-flex align-items-center gap-2"><Activity size={20} color="var(--color-accent)" /> Recent Activity</h3>
              <div className="card" style={{ maxHeight: 200, overflowY: 'auto' }}>
                <div className="card-body">
                  {trip.activityFeed?.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {trip.activityFeed.map((act) => (
                        <div key={act.id} className="d-flex gap-2 align-items-start">
                          <div className="rounded-circle mt-1" style={{ width: 8, height: 8, background: 'var(--color-primary)', flexShrink: 0 }} />
                          <div><span className="fw-semibold">{act.user}</span> {act.action}<div className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(act.timestamp).toLocaleString()}</div></div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-muted mb-0 fst-italic">No recent activity to show.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <>
          <div className="modal-backdrop show" style={{ backdropFilter: 'blur(4px)' }} onClick={() => setIsEditing(false)} />
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content animate-scale-in">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Trip</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setIsEditing(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <form id="editTripForm" onSubmit={handleSaveEdit}>
                    <div className="mb-3"><label className="form-label text-muted">Trip Name</label><input type="text" className="form-control" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required /></div>
                    <div className="mb-3"><label className="form-label text-muted">Destination</label><input type="text" className="form-control" value={editForm.destination} onChange={e => setEditForm({ ...editForm, destination: e.target.value })} required /></div>
                    <div className="row g-3 mb-3">
                      <div className="col-6"><label className="form-label text-muted">Start Date</label><input type="date" className="form-control" value={editForm.startDate} onChange={e => setEditForm({ ...editForm, startDate: e.target.value })} required style={{ colorScheme: 'dark' }} /></div>
                      <div className="col-6"><label className="form-label text-muted">End Date</label><input type="date" className="form-control" value={editForm.endDate} onChange={e => setEditForm({ ...editForm, endDate: e.target.value })} required style={{ colorScheme: 'dark' }} /></div>
                    </div>
                    <div className="mb-3"><label className="form-label text-muted">Budget</label><input type="number" className="form-control" value={editForm.budget} onChange={e => setEditForm({ ...editForm, budget: e.target.value })} /></div>
                    <hr />
                    <h6 className="mb-3">Visibility & Discovery</h6>
                    <div className="row g-3 mb-3">
                      <div className="col-6"><label className="form-label text-muted">Visibility</label><select className="form-select" value={editForm.visibility || 'private'} onChange={e => setEditForm({ ...editForm, visibility: e.target.value })}><option value="private">Private</option><option value="public">Public</option></select></div>
                      <div className="col-6"><label className="form-label text-muted">Difficulty</label><select className="form-select" value={editForm.difficulty || 'Moderate'} onChange={e => setEditForm({ ...editForm, difficulty: e.target.value })}><option value="Easy">Easy</option><option value="Moderate">Moderate</option><option value="Hard">Hard</option></select></div>
                    </div>
                    {editForm.visibility === 'public' && (
                      <>
                        <div className="mb-3"><label className="form-label text-muted">Tags (comma separated)</label><input type="text" className="form-control" value={Array.isArray(editForm.tags) ? editForm.tags.join(', ') : (editForm.tags || '')} onChange={e => setEditForm({ ...editForm, tags: e.target.value })} placeholder="e.g. Budget, Backpacking" /></div>
                        <div className="mb-3"><label className="form-label text-muted">Public Description</label><textarea className="form-control" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows="3" placeholder="Describe your trip..." /></div>
                      </>
                    )}
                  </form>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" form="editTripForm" className="btn btn-primary">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog isOpen={confirmDelete} title={`Delete "${trip?.title}"?`} message="This will permanently remove the trip and all data." confirmLabel="Delete Trip" onConfirm={() => { deleteTrip(id); navigate('/dashboard'); }} onCancel={() => setConfirmDelete(false)} />
    </div>
  );
};

export default TripDetail;