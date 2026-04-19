import React, { useContext, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : trip?.rating || 0;

  if (!trip) {
    return <div className="page-container glass-panel"><h2 style={{textAlign: 'center', margin: 'auto'}}>Public itinerary not found</h2></div>;
  }

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  
  // Wizard Config State
  const [config, setConfig] = useState({
    title: `${trip.title} (Copy)`,
    startDate: '',
    endDate: '',
    budget: trip.budget || 0,
    includeActivities: true,
    includeBookings: true,
    includeExpenses: false
  });

  const handleFork = () => {
    // 1. Increment fork count on the public trip
    forkTrip(id);
    
    // 2. Clone to my trips applying wizard config
    const clonedTrip = {
      ...trip,
      id: Math.random().toString(36).substr(2, 9),
      title: config.title,
      startDate: config.startDate,
      endDate: config.endDate,
      budget: Number(config.budget),
      visibility: 'private',
      status: 'planning',
      members: [{ id: 'm1', name: 'Current User', email: 'user@example.com', role: 'admin', online: true }],
      activityFeed: [{ id: Math.random().toString(), user: 'Current User', action: `forked this trip from ${trip.author.name}`, timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real app with database, we would also copy over activities/expenses/bookings here based on the toggles.
    // For now, we simulate success and save the shell to TripContext.
    setTrips(prev => [clonedTrip, ...prev]);
    
    // 3. Navigate to my new trip
    setIsWizardOpen(false);
    navigate(`/trip/${clonedTrip.id}`, { state: { autoEdit: true } });
  };

  return (
    <div className="page-container" style={{ padding: 'var(--space-8)' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: 'var(--space-6)', fontWeight: 600 }}>
        <ArrowLeft size={18} /> Back to Gallery
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ overflow: 'hidden' }}>
        
        <div style={{ position: 'relative', height: '350px' }}>
          <img src={trip.image} alt={trip.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--glass-bg) 0%, rgba(0,0,0,0.2) 100%)' }} />
          
          <div style={{ position: 'absolute', bottom: 'var(--space-6)', left: 'var(--space-6)', right: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-2)' }}>
                <span style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                  <Star size={16} fill="#fbbf24" /> {avgRating} ({reviews.length})
                </span>
                <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                  <Copy size={16} /> {trip.forks} Forks
                </span>
              </div>
              <h1 style={{ fontSize: '3rem', margin: '0 0 var(--space-2) 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{trip.title}</h1>
              <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', margin: 0 }}>
                <MapPin size={18} /> {trip.destination}
              </p>
            </div>
            
            <motion.button 
              onClick={() => setIsWizardOpen(true)}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white', padding: '16px 32px', borderRadius: 'var(--radius-full)', border: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(56,189,248,0.4)' }}
            >
              <Copy size={20} /> Copy to My Trips
            </motion.button>
          </div>
        </div>

        <div style={{ padding: 'var(--space-8)', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-8)' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <section>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="var(--color-primary)" /> About this Route
              </h2>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
                {trip.description}
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={20} color="var(--color-secondary)" /> Themes & Tags
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {trip.tags?.map(tag => (
                  <span key={tag} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-4)' }}>Trip Itinerary Preview</h2>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <p>When you copy this trip, you can selectively import its timeline, accommodations, and estimated budgets into your planner.</p>
                <button onClick={() => setIsWizardOpen(true)} style={{ background: 'var(--color-surface)', color: 'white', padding: '8px 24px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', fontWeight: 600, cursor: 'pointer', marginTop: 'var(--space-4)' }}>
                  Fork to see details
                </button>
              </div>
            </section>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 var(--space-4) 0' }}>Created By</h3>
              <Link to={`/user/${trip.author.id}`} style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit' }}>
                <img src={trip.author.avatar} alt={trip.author.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{trip.author.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>View Profile</div>
                </div>
              </Link>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 var(--space-4) 0' }}>Trip Overview</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /> Duration</span>
                  <span style={{ fontWeight: 600 }}>{trip.durationDays} Days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><DollarSign size={16} /> Est. Budget</span>
                  <span style={{ fontWeight: 600 }}>{trip.budget} {trip.currency}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} /> Difficulty</span>
                  <span style={{ fontWeight: 600 }}>{trip.difficulty}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* Review Section Mounted Here */}
      <ReviewSection tripId={trip.id} />

      {/* Fork Wizard Modal */}
      <AnimatePresence>
        {isWizardOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsWizardOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }} />
            
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: 'var(--space-8)', position: 'relative', zIndex: 1001 }}>
              <button onClick={() => setIsWizardOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
              
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>Fork Itinerary</h2>
                <div style={{ display: 'flex', gap: '8px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  <span style={{ color: step >= 1 ? 'var(--color-primary)' : 'inherit', fontWeight: step >= 1 ? 'bold' : 'normal' }}>1. Basics</span> &gt; 
                  <span style={{ color: step >= 2 ? 'var(--color-primary)' : 'inherit', fontWeight: step >= 2 ? 'bold' : 'normal' }}>2. Content</span> &gt; 
                  <span style={{ color: step >= 3 ? 'var(--color-primary)' : 'inherit', fontWeight: step >= 3 ? 'bold' : 'normal' }}>3. Review</span>
                </div>
              </div>

              {/* STEP 1: BASICS */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>New Trip Name</label>
                      <input type="text" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Start Date</label>
                        <input type="date" value={config.startDate} onChange={e => setConfig({...config, startDate: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', colorScheme: 'dark' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>End Date</label>
                        <input type="date" value={config.endDate} onChange={e => setConfig({...config, endDate: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', colorScheme: 'dark' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Estimated Budget</label>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0 12px' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>{trip.currency}</span>
                        <input type="number" value={config.budget} onChange={e => setConfig({...config, budget: e.target.value})} style={{ width: '100%', padding: '12px 8px', background: 'transparent', border: 'none', color: 'white', outline: 'none' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                    <button onClick={() => setStep(2)} style={{ background: 'var(--color-primary)', color: 'white', padding: '10px 24px', borderRadius: 'var(--radius-full)', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Next</button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: CONTENT */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>Select exactly what data you want to import from the original itinerary.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {/* Toggle Item */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <List size={20} color="var(--color-secondary)" />
                        <div>
                          <div style={{ fontWeight: 'bold' }}>Activities & Timeline</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Daily schedule, maps, and notes</div>
                        </div>
                      </div>
                      <input type="checkbox" checked={config.includeActivities} onChange={e => setConfig({...config, includeActivities: e.target.checked})} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <HomeIcon size={20} color="var(--color-accent)" />
                        <div>
                          <div style={{ fontWeight: 'bold' }}>Accommodations & Flights</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Hotel bookings, flights, and transit</div>
                        </div>
                      </div>
                      <input type="checkbox" checked={config.includeBookings} onChange={e => setConfig({...config, includeBookings: e.target.checked})} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CreditCard size={20} color="var(--color-danger)" />
                        <div>
                          <div style={{ fontWeight: 'bold' }}>Original Expenses</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>The creator's detailed logged expenses</div>
                        </div>
                      </div>
                      <input type="checkbox" checked={config.includeExpenses} onChange={e => setConfig({...config, includeExpenses: e.target.checked})} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)' }}>
                    <button onClick={() => setStep(1)} style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'white', padding: '10px 24px', borderRadius: 'var(--radius-full)', cursor: 'pointer' }}>Back</button>
                    <button onClick={() => setStep(3)} style={{ background: 'var(--color-primary)', color: 'white', padding: '10px 24px', borderRadius: 'var(--radius-full)', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Review</button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: REVIEW */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-primary)', position: 'relative' }}>
                    <CheckCircle size={32} color="var(--color-success)" style={{ position: 'absolute', top: -16, right: -16, background: 'var(--color-bg)', borderRadius: '50%' }} />
                    <h3 style={{ margin: '0 0 var(--space-4) 0' }}>{config.title}</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Destination</span>
                        <span>{trip.destination}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Dates</span>
                        <span>{config.startDate || 'TBD'} to {config.endDate || 'TBD'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Budget</span>
                        <span>{config.budget} {trip.currency}</span>
                      </div>
                      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Include Activities</span>
                        <span>{config.includeActivities ? 'Yes' : 'No'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Include Bookings</span>
                        <span>{config.includeBookings ? 'Yes' : 'No'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Include Expenses</span>
                        <span>{config.includeExpenses ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)' }}>
                    <button onClick={() => setStep(2)} style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'white', padding: '10px 24px', borderRadius: 'var(--radius-full)', cursor: 'pointer' }}>Back</button>
                    <button onClick={handleFork} style={{ background: 'linear-gradient(135deg, var(--color-success), #059669)', color: 'white', padding: '10px 32px', borderRadius: 'var(--radius-full)', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}>
                      Create My Trip
                    </button>
                  </div>
                </motion.div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ExistingItineraryDetail;