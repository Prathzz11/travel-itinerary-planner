import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Activity, Edit2, Trash2, Clock, DollarSign, X, Globe, Lock } from 'lucide-react';
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

  const trip = trips?.find(t => t.id === id);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading fetch
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [id]);

  React.useEffect(() => {
    // If autoEdit is passed, open the edit form with the trip data populated
    if (location.state?.autoEdit && trip) {
      setEditForm(trip);
      setIsEditing(true);
      // Clear the state so it doesn't reopen on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.autoEdit, trip, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner size={48} />
          <p style={{ marginTop: '16px', color: 'var(--color-text-muted)' }}>Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return <div className="page-container glass-panel"><h2 style={{textAlign: 'center', margin: 'auto'}}>Trip not found</h2></div>;
  }

  const handleDelete = () => {
    setConfirmDelete(true);
  };

  const handleEditClick = () => {
    setEditForm(trip);
    setIsEditing(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    
    // Convert comma-separated tags to array if string
    const processedForm = { ...editForm };
    if (typeof processedForm.tags === 'string') {
      processedForm.tags = processedForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    updateTrip(id, processedForm);
    
    // If we changed to public, publish to ExploreContext
    if (processedForm.visibility === 'public' && trip.visibility !== 'public') {
       publishTrip({
         id: trip.id,
         title: processedForm.title,
         destination: processedForm.destination,
         author: { id: 'u1', name: 'Current User', avatar: 'https://i.pravatar.cc/150?u=u1' },
         image: trip.image,
         budget: processedForm.budget,
         currency: trip.currency,
         durationDays: 7, // mock
         difficulty: processedForm.difficulty || 'Moderate',
         tags: processedForm.tags || [],
         description: processedForm.description || ''
       });
    }
    
    setIsEditing(false);
  };

  return (
    <div className="page-container" style={{ padding: 'var(--space-8)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel" 
        style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}
      >
        {/* Hero Section */}
        <div style={{ position: 'relative', height: '300px', width: '100%' }}>
          <img src={trip.image} alt={trip.destination} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--glass-bg) 0%, rgba(0,0,0,0.4) 100%)' }} />
          
          {/* Admin Controls */}
          <div style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-6)', display: 'flex', gap: 'var(--space-2)' }}>
            <button onClick={handleEditClick} style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
              <Edit2 aria-hidden="true" size={16} /> Edit
            </button>
            <button onClick={handleDelete} style={{ background: 'rgba(239,68,68,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
              <Trash2 aria-hidden="true" size={16} /> Delete
            </button>
          </div>

          <div style={{ position: 'absolute', bottom: 'var(--space-6)', left: 'var(--space-6)', right: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ display: 'inline-block', background: 'var(--color-primary)', color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
                  {trip.status}
                </div>
                <h1 style={{ fontSize: '2.5rem', margin: '0 0 var(--space-2) 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{trip.title}</h1>
                <div style={{ display: 'flex', gap: 'var(--space-6)', color: 'rgba(255,255,255,0.9)', marginBottom: 'var(--space-2)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {trip.destination}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {formatTripDates(trip.startDate, trip.endDate)}</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: trip.visibility === 'public' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)', color: trip.visibility === 'public' ? '#6ee7b7' : 'white', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', border: `1px solid ${trip.visibility === 'public' ? 'var(--color-success)' : 'rgba(255,255,255,0.2)'}` }}>
                  {trip.visibility === 'public' ? <><Globe size={14} /> Public</> : <><Lock size={14} /> Private</>}
                </div>
              </div>
              <div style={{ textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}><Clock size={12} /> Created: {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'Unknown'}</div>
                {trip.updatedAt && <div style={{ marginTop: '4px' }}>Last modified: {new Date(trip.updatedAt).toLocaleDateString()}</div>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: 'var(--space-6)' }}>
          <TripNav tripId={trip.id} />
          
          {/* Overview Content */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            
            {/* Statistics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-3)' }}>Trip Statistics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                    <Activity size={24} color="var(--color-primary)" style={{ margin: '0 auto var(--space-2)' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{trip.activitiesCount || 0}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Activities</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                    <Users size={24} color="var(--color-secondary)" style={{ margin: '0 auto var(--space-2)' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{trip.members?.length || 1}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Members</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                    <DollarSign size={24} color="var(--color-success)" style={{ margin: '0 auto var(--space-2)' }} />
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{trip.budget ? `${trip.budget.toLocaleString()} ${trip.currency || 'USD'}` : 'N/A'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Budget</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={20} color="var(--color-accent)" /> Recent Activity
                </h3>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', maxHeight: '200px', overflowY: 'auto' }}>
                  {trip.activityFeed && trip.activityFeed.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {trip.activityFeed.map((activity) => (
                        <div key={activity.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', marginTop: '6px' }} />
                          <div>
                            <span style={{ fontWeight: 600 }}>{activity.user}</span> {activity.action}
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(activity.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--color-text-muted)', margin: 0, fontStyle: 'italic' }}>No recent activity to show.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }} />
            
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-6)', position: 'relative', zIndex: 1001, maxHeight: '90vh', overflowY: 'auto' }}>
              <button aria-label="Cancel editing" onClick={() => setIsEditing(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X aria-hidden="true" size={24} />
              </button>
              
              <h2 style={{ margin: '0 0 var(--space-6) 0' }}>Edit Trip</h2>
              
              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Trip Name</label>
                  <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Destination</label>
                  <input type="text" value={editForm.destination} onChange={e => setEditForm({...editForm, destination: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} required />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Start Date</label>
                    <input type="date" value={editForm.startDate} onChange={e => setEditForm({...editForm, startDate: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', colorScheme: 'dark' }} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>End Date</label>
                    <input type="date" value={editForm.endDate} onChange={e => setEditForm({...editForm, endDate: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', colorScheme: 'dark' }} required />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Budget</label>
                  <input type="number" value={editForm.budget} onChange={e => setEditForm({...editForm, budget: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} />
                </div>
                
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: 'var(--space-4) 0' }} />
                <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1.1rem' }}>Visibility & Discovery</h3>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Visibility</label>
                    <select value={editForm.visibility || 'private'} onChange={e => setEditForm({...editForm, visibility: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }}>
                      <option value="private">Private (Only Members)</option>
                      <option value="public">Public (Explore Gallery)</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Difficulty</label>
                    <select value={editForm.difficulty || 'Moderate'} onChange={e => setEditForm({...editForm, difficulty: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }}>
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {editForm.visibility === 'public' && (
                  <>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Tags (comma separated)</label>
                      <input type="text" value={Array.isArray(editForm.tags) ? editForm.tags.join(', ') : (editForm.tags || '')} onChange={e => setEditForm({...editForm, tags: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} placeholder="e.g. Budget, Backpacking, Culture" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Public Description</label>
                      <textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', minHeight: '80px' }} placeholder="Describe your trip for others..." />
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-primary)', border: 'none', borderRadius: '20px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmDelete}
        title={`Delete "${trip?.title}"?`}
        message="This will permanently remove the trip along with all itinerary data, expenses, and members. This cannot be undone."
        confirmLabel="Delete Trip"
        onConfirm={() => { deleteTrip(id); navigate('/dashboard'); }}
        onCancel={() => setConfirmDelete(false)}
      />

    </div>
  );
};

export default TripDetail;