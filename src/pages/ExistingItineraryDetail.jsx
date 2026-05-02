import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Copy, Star, MapPin, Clock, IndianRupee, Activity, Tag, ArrowLeft, X, CheckCircle, List, Home as HomeIcon, CreditCard, FileJson, Download } from 'lucide-react';
import { ExploreContext } from '../contexts/ExploreContext';
import { TripContext } from '../contexts/TripContext';
import { useAuth } from '../contexts/AuthContext';
import ReviewSection from '../components/explore/ReviewSection';

const ExistingItineraryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTripById, forkTrip, getTripReviews, loadTripReviews } = useContext(ExploreContext);
  const { trips, setTrips, importTrip } = useContext(TripContext);
  const trip = getTripById(id);
  const reviews = trip ? getTripReviews(trip._id || trip.id) : [];
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : trip?.rating || 0;

  const { user, logView } = useAuth();

  useEffect(() => {
    if (trip && (trip._id || trip.id)) {
      logView(trip._id || trip.id);
      loadTripReviews(trip._id || trip.id);
    }
  }, [trip?._id, trip?.id, logView, loadTripReviews]);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({ title: `${trip?.title || 'Trip'} (Copy)`, startDate: '', endDate: '', budget: trip?.budget || 0, includeActivities: true, includeBookings: true, includeExpenses: false });
  const [isSaving, setIsSaving] = useState(false);

  if (!trip) return <div className="page-container"><div className="card text-center py-5"><h2>Itinerary not found</h2></div></div>;

  const handleFork = async () => {
    setIsSaving(true);
    try {
      forkTrip(id); // Increment forks count locally/API
      
      const tripData = {
        title: config.title,
        destination: trip.destination,
        startDate: config.startDate,
        endDate: config.endDate,
        budget: Number(config.budget),
        currency: trip.currency,
        publishToExplore: false, // Don't republish the fork back to explore
        days: config.includeActivities ? trip.days : []
      };

      // We use importTrip because it conveniently creates both Trip and Itinerary from a single payload
      const newTrip = await importTrip(tripData);
      
      setIsWizardOpen(false);
      navigate(`/trip/${newTrip._id || newTrip.id}`, { state: { autoEdit: true } });
    } catch (error) {
      console.error('Failed to fork trip', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadSource = () => {
    // Generate a sanitized JSON of the trip data as the "original source document"
    const sourceData = {
      title: trip.title,
      destination: trip.destination,
      durationDays: trip.durationDays || trip.duration,
      budget: trip.budget || trip.estimatedBudget,
      currency: trip.currency || 'INR',
      difficulty: trip.difficulty,
      tags: trip.tags || [],
      days: trip.days || []
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sourceData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${trip.title.replace(/\\s+/g, '_')}_Original_Source.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
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
              <section>
                <h4 className="mb-3">Trip Itinerary</h4>
                {trip.days && trip.days.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {trip.days.map((day, idx) => (
                      <div key={idx} className="card border-secondary">
                        <div className="card-header bg-dark d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">Day {day.dayNumber}: {day.title || 'Activities'}</h6>
                        </div>
                        <div className="card-body p-0">
                          <div className="list-group list-group-flush">
                            {day.activities && day.activities.length > 0 ? (
                              day.activities.map((act, i) => (
                                <div key={i} className="list-group-item bg-transparent d-flex justify-content-between align-items-center p-3">
                                  <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-circle bg-secondary bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                      {i + 1}
                                    </div>
                                    <div>
                                      <div className="fw-semibold">{act.name}</div>
                                      <div className="text-muted small d-flex gap-2">
                                        <span className="badge bg-dark border border-secondary">{act.category}</span>
                                        {act.duration && <span>{Math.floor(act.duration / 60)}h {act.duration % 60}m</span>}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-muted small">No activities logged for this day.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-5 rounded-3" style={{ background: 'rgba(0,0,0,0.15)' }}>
                    <p className="text-muted mb-3">Copy this trip to import its timeline, accommodations, and budgets.</p>
                    <button className="btn btn-outline-secondary" onClick={() => setIsWizardOpen(true)}>Fork to see details</button>
                  </div>
                )}
              </section>
            </div>
            <div className="col-md-4 d-flex flex-column gap-3">
              <div className="card"><div className="card-body"><h6 className="mb-3">Created By</h6><Link to={`/user/${trip.author?._id || trip.author?.id || 'unknown'}`} className="d-flex align-items-center gap-3 text-decoration-none text-white"><img src={trip.author?.avatar || trip.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(trip.author?.name || trip.authorName || 'User')}`} alt={trip.author?.name || trip.authorName} className="rounded-circle" style={{ width: 50, height: 50, objectFit: 'cover' }} /><div><div className="fw-bold">{trip.author?.name || trip.authorName}</div><div className="small" style={{ color: 'var(--color-primary)' }}>View Profile</div></div></Link></div></div>
              <div className="card">
                <div className="card-body">
                  <h6 className="mb-3">Trip Overview</h6>
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between"><span className="text-muted d-flex align-items-center gap-1"><Clock size={14} /> Duration</span><span className="fw-semibold">{trip.durationDays || trip.duration} Days</span></div>
                    <div className="d-flex justify-content-between"><span className="text-muted d-flex align-items-center gap-1"><IndianRupee size={14} /> Budget</span><span className="fw-semibold">{trip.budget || trip.estimatedBudget} {trip.currency}</span></div>
                    <div className="d-flex justify-content-between"><span className="text-muted d-flex align-items-center gap-1"><Activity size={14} /> Difficulty</span><span className="fw-semibold">{trip.difficulty}</span></div>
                    <div className="d-flex justify-content-between"><span className="text-muted d-flex align-items-center gap-1"><List size={14} /> Activities</span><span className="fw-semibold">{trip.days?.reduce((sum, day) => sum + (day.activities?.length || 0), 0) || 0}</span></div>
                    <div className="d-flex justify-content-between"><span className="text-muted d-flex align-items-center gap-1"><Star size={14} /> Views</span><span className="fw-semibold">{trip.views || 0}</span></div>
                  </div>
                </div>
              </div>

              {/* Source Document Section */}
              <div className="card border-primary bg-primary bg-opacity-10">
                <div className="card-body">
                  <h6 className="mb-2 d-flex align-items-center gap-2 text-primary">
                    <FileJson size={16} /> Source Document
                  </h6>
                  <p className="text-muted small mb-3">
                    Download the original structured itinerary file provided by the creator.
                  </p>
                  <button 
                    className="btn btn-sm btn-primary w-100 d-flex justify-content-center align-items-center gap-2"
                    onClick={handleDownloadSource}
                  >
                    <Download size={14} /> Download Original File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReviewSection tripId={trip._id || trip.id} />

      {/* Fork Wizard Modal */}
      {isWizardOpen && (
        <>
          <div className="modal-backdrop show" style={{ backdropFilter: 'blur(4px)', zIndex: 1040, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setIsWizardOpen(false)} />
          <div className="modal d-flex align-items-center justify-content-center" tabIndex="-1" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050, overflow: 'hidden' }}>
            <div className="modal-dialog w-100" style={{ maxWidth: '600px', margin: 0 }}>
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