import React, { useContext, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Copy, Star, MapPin, Clock, DollarSign, Activity, Tag, ArrowLeft, X, CheckCircle, List, Home as HomeIcon, CreditCard } from 'lucide-react';
import { ExploreContext } from '../contexts/ExploreContext';
import { TripContext } from '../contexts/TripContext';
import ReviewSection from '../components/explore/ReviewSection';

const ExistingItineraryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTripById, forkTrip, getTripReviews } = useContext(ExploreContext);
  const { trips, setTrips } = useContext(TripContext);
  const trip = getTripById(id);
  const reviews = trip ? getTripReviews(trip.id) : [];
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : trip?.rating || 0;

  if (!trip) return <div className="page-container"><div className="card text-center py-5"><h2>Itinerary not found</h2></div></div>;

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({ title: `${trip.title} (Copy)`, startDate: '', endDate: '', budget: trip.budget || 0, includeActivities: true, includeBookings: true, includeExpenses: false });

  const handleFork = () => {
    forkTrip(id);
    const clonedTrip = { ...trip, id: Math.random().toString(36).substr(2, 9), title: config.title, startDate: config.startDate, endDate: config.endDate, budget: Number(config.budget), visibility: 'private', status: 'planning', members: [{ id: 'm1', name: 'Current User', email: 'user@example.com', role: 'admin', online: true }], activityFeed: [{ id: Math.random().toString(), user: 'Current User', action: `forked from ${trip.author.name}`, timestamp: new Date().toISOString() }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setTrips(prev => [clonedTrip, ...prev]);
    setIsWizardOpen(false);
    navigate(`/trip/${clonedTrip.id}`, { state: { autoEdit: true } });
  };

  return (
    <div className="page-container animate-fade-in">
      <button className="btn btn-link text-muted text-decoration-none d-flex align-items-center gap-1 mb-3" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Back to Gallery</button>

      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Hero */}
        <div className="position-relative" style={{ height: 350 }}>
          <img src={trip.image} alt={trip.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(0,0,0,0.2) 100%)' }} />
          <div className="position-absolute bottom-0 start-0 end-0 p-4 d-flex justify-content-between align-items-end">
            <div>
              <div className="d-flex gap-2 mb-2">
                <span className="badge d-flex align-items-center gap-1" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}><Star size={14} fill="#fbbf24" /> {avgRating} ({reviews.length})</span>
                <span className="badge d-flex align-items-center gap-1" style={{ background: 'rgba(56,189,248,0.2)', color: 'var(--color-primary)' }}><Copy size={14} /> {trip.forks} Forks</span>
              </div>
              <h1 className="display-5 fw-bold mb-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{trip.title}</h1>
              <p className="fs-5 d-flex align-items-center gap-1 mb-0" style={{ color: 'rgba(255,255,255,0.9)' }}><MapPin size={18} /> {trip.destination}</p>
            </div>
            <button className="btn btn-primary btn-lg d-flex align-items-center gap-2 fw-bold" style={{ boxShadow: '0 4px 12px rgba(56,189,248,0.4)' }} onClick={() => setIsWizardOpen(true)}><Copy size={20} /> Copy to My Trips</button>
          </div>
        </div>

        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-8 d-flex flex-column gap-4">
              <section><h4 className="d-flex align-items-center gap-2"><Activity size={18} color="var(--color-primary)" /> About this Route</h4><p className="text-muted" style={{ lineHeight: 1.7 }}>{trip.description}</p></section>
              <section><h4 className="d-flex align-items-center gap-2"><Tag size={18} color="var(--color-secondary)" /> Themes & Tags</h4><div className="d-flex flex-wrap gap-2">{trip.tags?.map(tag => <span key={tag} className="badge bg-secondary bg-opacity-25 border">{tag}</span>)}</div></section>
              <section><h4 className="mb-3">Trip Itinerary Preview</h4><div className="text-center p-5 rounded-3" style={{ background: 'rgba(0,0,0,0.15)' }}><p className="text-muted mb-3">Copy this trip to import its timeline, accommodations, and budgets.</p><button className="btn btn-outline-secondary" onClick={() => setIsWizardOpen(true)}>Fork to see details</button></div></section>
            </div>
            <div className="col-md-4 d-flex flex-column gap-3">
              <div className="card"><div className="card-body"><h6 className="mb-3">Created By</h6><Link to={`/user/${trip.author.id}`} className="d-flex align-items-center gap-3 text-decoration-none text-white"><img src={trip.author.avatar} alt={trip.author.name} className="rounded-circle" style={{ width: 50, height: 50, objectFit: 'cover' }} /><div><div className="fw-bold">{trip.author.name}</div><div className="small" style={{ color: 'var(--color-primary)' }}>View Profile</div></div></Link></div></div>
              <div className="card"><div className="card-body"><h6 className="mb-3">Trip Overview</h6><div className="d-flex flex-column gap-3"><div className="d-flex justify-content-between"><span className="text-muted d-flex align-items-center gap-1"><Clock size={14} /> Duration</span><span className="fw-semibold">{trip.durationDays} Days</span></div><div className="d-flex justify-content-between"><span className="text-muted d-flex align-items-center gap-1"><DollarSign size={14} /> Budget</span><span className="fw-semibold">{trip.budget} {trip.currency}</span></div><div className="d-flex justify-content-between"><span className="text-muted d-flex align-items-center gap-1"><Activity size={14} /> Difficulty</span><span className="fw-semibold">{trip.difficulty}</span></div></div></div></div>
            </div>
          </div>
        </div>
      </div>

      <ReviewSection tripId={trip.id} />

      {/* Fork Wizard Modal */}
      {isWizardOpen && (
        <>
          <div className="modal-backdrop show" style={{ backdropFilter: 'blur(4px)' }} onClick={() => setIsWizardOpen(false)}></div>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content animate-scale-in">
                <div className="modal-header">
                  <div><h5 className="modal-title mb-1">Fork Itinerary</h5><div className="d-flex gap-2 text-muted small">{[1,2,3].map(s => <span key={s} style={{ color: step >= s ? 'var(--color-primary)' : undefined, fontWeight: step >= s ? 'bold' : 'normal' }}>{s}. {s===1?'Basics':s===2?'Content':'Review'}</span>)}</div></div>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setIsWizardOpen(false)}></button>
                </div>
                <div className="modal-body">
                  {step === 1 && (
                    <div className="animate-slide-left d-flex flex-column gap-3">
                      <div><label className="form-label text-muted">New Trip Name</label><input type="text" className="form-control" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} /></div>
                      <div className="row g-3"><div className="col-6"><label className="form-label text-muted">Start Date</label><input type="date" className="form-control" value={config.startDate} onChange={e => setConfig({...config, startDate: e.target.value})} style={{ colorScheme: 'dark' }} /></div><div className="col-6"><label className="form-label text-muted">End Date</label><input type="date" className="form-control" value={config.endDate} onChange={e => setConfig({...config, endDate: e.target.value})} style={{ colorScheme: 'dark' }} /></div></div>
                      <div><label className="form-label text-muted">Estimated Budget</label><div className="input-group"><span className="input-group-text">{trip.currency}</span><input type="number" className="form-control" value={config.budget} onChange={e => setConfig({...config, budget: e.target.value})} /></div></div>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="animate-slide-left d-flex flex-column gap-3">
                      <p className="text-muted">Select what to import:</p>
                      {[{key:'includeActivities',icon:<List size={18} color="var(--color-secondary)"/>,label:'Activities & Timeline',desc:'Daily schedule, maps, notes'},{key:'includeBookings',icon:<HomeIcon size={18} color="var(--color-accent)"/>,label:'Accommodations & Flights',desc:'Hotel bookings, flights'},{key:'includeExpenses',icon:<CreditCard size={18} color="var(--color-danger)"/>,label:'Original Expenses',desc:"Creator's logged expenses"}].map(item => (
                        <div key={item.key} className="d-flex justify-content-between align-items-center p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="d-flex align-items-center gap-3">{item.icon}<div><div className="fw-bold">{item.label}</div><div className="text-muted small">{item.desc}</div></div></div>
                          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" checked={config[item.key]} onChange={e => setConfig({...config, [item.key]: e.target.checked})} /></div>
                        </div>
                      ))}
                    </div>
                  )}
                  {step === 3 && (
                    <div className="animate-slide-left">
                      <div className="card border-primary position-relative p-4">
                        <CheckCircle size={28} color="var(--color-success)" className="position-absolute" style={{ top: -14, right: -14, background: 'var(--bs-body-bg)', borderRadius: '50%' }} />
                        <h5 className="mb-3">{config.title}</h5>
                        <div className="d-flex flex-column gap-2 small">
                          <div className="d-flex justify-content-between"><span className="text-muted">Destination</span><span>{trip.destination}</span></div>
                          <div className="d-flex justify-content-between"><span className="text-muted">Dates</span><span>{config.startDate || 'TBD'} to {config.endDate || 'TBD'}</span></div>
                          <div className="d-flex justify-content-between"><span className="text-muted">Budget</span><span>{config.budget} {trip.currency}</span></div>
                          <hr className="my-2" />
                          <div className="d-flex justify-content-between"><span className="text-muted">Activities</span><span>{config.includeActivities ? 'Yes' : 'No'}</span></div>
                          <div className="d-flex justify-content-between"><span className="text-muted">Bookings</span><span>{config.includeBookings ? 'Yes' : 'No'}</span></div>
                          <div className="d-flex justify-content-between"><span className="text-muted">Expenses</span><span>{config.includeExpenses ? 'Yes' : 'No'}</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  {step > 1 && <button className="btn btn-outline-secondary" onClick={() => setStep(s => s - 1)}>Back</button>}
                  {step < 3 ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Next</button> : <button className="btn btn-success fw-bold" onClick={handleFork}>Create My Trip</button>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExistingItineraryDetail;