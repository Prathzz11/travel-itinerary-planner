import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Users, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { useTrip } from '../hooks/useTrip';
import { useForm } from '../hooks/useForm';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useAuth';

const CreateTrip = () => {
  const navigate = useNavigate();
  const { addTrip, trips } = useTrip();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [step, setStep] = useState(1);
  const pendingNavigateId = useRef(null);

  const { values, errors, touched, handleChange, handleBlur, clearDraft, setFieldValue } = useForm({
    initialValues: {
      title: '',
      destination: '',
      startDate: '',
      endDate: '',
      budget: '',
      currency: 'USD',
      visibility: 'private'
    },
    draftKey: 'create_trip_draft',
    validate: (vals) => {
      const errs = {};
      if (!vals.title?.trim()) errs.title = 'Title is required';
      if (!vals.destination?.trim()) errs.destination = 'Destination is required';
      if (!vals.startDate) errs.startDate = 'Start date is required';
      if (!vals.endDate) errs.endDate = 'End date is required';
      if (vals.startDate && vals.endDate && new Date(vals.startDate) > new Date(vals.endDate)) {
        errs.endDate = 'End date must be after start date';
      }
      if (!vals.budget || Number(vals.budget) <= 0) errs.budget = 'Budget must be > 0';
      return errs;
    },
    onSubmit: () => {}
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // Navigate to new trip once it appears in context state
  useEffect(() => {
    if (pendingNavigateId.current) {
      const found = trips?.find(t => t.id === pendingNavigateId.current);
      if (found) {
        const id = pendingNavigateId.current;
        pendingNavigateId.current = null;
        navigate(`/trip/${id}`, { state: { autoEdit: true } });
      }
    }
  }, [trips, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 4) {
      nextStep();
      return;
    }

    // Build the new trip with a proper structure matching TripContext seed data
    const newId = Math.random().toString(36).substr(2, 9);
    const creator = user
      ? { id: user.id || 'm_creator', name: user.name, email: user.email, role: 'admin', joinedAt: new Date().toISOString(), avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`, online: true }
      : { id: 'm_creator', name: 'You', email: '', role: 'admin', joinedAt: new Date().toISOString(), avatar: 'https://i.pravatar.cc/150?u=creator', online: true };

    const newTrip = {
      id: newId,
      ...values,
      budget: Number(values.budget),
      spent: 0,
      image: `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80`,
      members: [creator],
      status: 'planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activitiesCount: 0,
      activityFeed: [
        { id: `af_${Date.now()}`, user: creator.name, action: 'created the trip', timestamp: new Date().toISOString() }
      ]
    };

    pendingNavigateId.current = newId;
    addTrip(newTrip);
    clearDraft();
    addNotification(`"${newTrip.title}" created! Let's plan your adventure! 🎉`, 'success');
  };

  const isStepValid = () => {
    if (step === 1) return !errors.title && !errors.destination && values.title && values.destination;
    if (step === 2) return !errors.startDate && !errors.endDate && values.startDate && values.endDate;
    if (step === 3) return !errors.budget && values.budget;
    return true;
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const [direction, setDirection] = useState(1);
  const handleNavClick = (newDirection, action) => {
    setDirection(newDirection);
    action();
  };

  return (
    <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-8)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'var(--color-border)', zIndex: 0, transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, height: '2px', background: 'var(--color-primary)', zIndex: 0, transform: 'translateY(-50%)', width: `${((step - 1) / 3) * 100}%`, transition: 'width 0.3s ease' }} />
          
          {[1, 2, 3, 4].map(num => (
            <div key={num} style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: step >= num ? 'var(--color-primary)' : 'var(--color-bg)',
              border: `2px solid ${step >= num ? 'var(--color-primary)' : 'var(--color-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: step >= num ? '#fff' : 'var(--color-text-muted)',
              fontWeight: 600, zIndex: 1, transition: 'all 0.3s ease'
            }}>
              {step > num ? <CheckCircle size={20} /> : num}
            </div>
          ))}
        </div>

        {/* Wizard Form */}
        <motion.div className="glass-panel" style={{ padding: 'var(--space-8)', position: 'relative', overflow: 'hidden', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <AnimatePresence mode="wait" custom={direction}>
              
              {/* STEP 1: Destination */}
              {step === 1 && (
                <motion.div key="step1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <MapPin size={40} color="var(--color-primary)" style={{ margin: '0 auto var(--space-2)' }} />
                    <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Where are you going?</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Give your trip a name and destination.</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ position: 'relative' }}>
                      <input type="text" name="title" placeholder="Trip Title (e.g., Summer in Paris)" value={values.title} onChange={handleChange} onBlur={handleBlur} required
                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${errors.title && touched.title ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', color: 'white' }} />
                    </div>
                    {errors.title && touched.title && (
                      <span role="alert" style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                        {errors.title}
                      </span>
                    )}
                    <div style={{ position: 'relative' }}>
                      <input type="text" name="destination" placeholder="Destination City/Country" value={values.destination} onChange={handleChange} onBlur={handleBlur} required
                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${errors.destination && touched.destination ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', color: 'white' }} />
                    </div>
                    {errors.destination && touched.destination && (
                      <span role="alert" style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                        {errors.destination}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Dates */}
              {step === 2 && (
                <motion.div key="step2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Calendar size={40} color="var(--color-secondary)" style={{ margin: '0 auto var(--space-2)' }} />
                    <h2 style={{ fontSize: '1.8rem', margin: 0 }}>When is your trip?</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Select your travel dates.</p>
                  </div>
                  
                  <div className="responsive-flex">
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Start Date</label>
                      <input type="date" name="startDate" value={values.startDate} onChange={handleChange} onBlur={handleBlur} required
                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${errors.startDate && touched.startDate ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', color: 'white', colorScheme: 'dark' }} />
                      {errors.startDate && touched.startDate && (
                        <span role="alert" style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                          {errors.startDate}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>End Date</label>
                      <input type="date" name="endDate" value={values.endDate} onChange={handleChange} onBlur={handleBlur} required
                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${errors.endDate && touched.endDate ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', color: 'white', colorScheme: 'dark' }} />
                      {errors.endDate && touched.endDate && (
                        <span role="alert" style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                          {errors.endDate}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Budget */}
              {step === 3 && (
                <motion.div key="step3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <DollarSign size={40} color="var(--color-success)" style={{ margin: '0 auto var(--space-2)' }} />
                    <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Set a Budget</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>How much are you planning to spend?</p>
                  </div>
                  
                  <div className="responsive-flex">
                    <div style={{ flex: 2 }}>
                      <input type="number" name="budget" placeholder="Estimated Budget" value={values.budget} onChange={handleChange} onBlur={handleBlur} min="0" required
                        style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${errors.budget && touched.budget ? 'var(--color-danger)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', color: 'white' }} />
                      {errors.budget && touched.budget && (
                        <span role="alert" style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                          {errors.budget}
                        </span>
                      )}
                    </div>
                    <select name="currency" value={values.currency} onChange={handleChange}
                      style={{ flex: 1, background: 'rgba(15,23,42,0.5)', border: '1px solid var(--color-border)', color: 'white', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Visibility */}
              {step === 4 && (
                <motion.div key="step4" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Users size={40} color="var(--color-accent)" style={{ margin: '0 auto var(--space-2)' }} />
                    <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Trip Privacy</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Who can see this itinerary?</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', background: 'rgba(15,23,42,0.5)', border: `1px solid ${values.visibility === 'private' ? 'var(--color-primary)' : 'var(--color-border)'}`, padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                      <input aria-label="Private Trip" type="radio" name="visibility" value="private" checked={values.visibility === 'private'} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                      <div>
                        <h4 style={{ margin: 0 }}>Private</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Only you and invited members.</p>
                      </div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', background: 'rgba(15,23,42,0.5)', border: `1px solid ${values.visibility === 'public' ? 'var(--color-primary)' : 'var(--color-border)'}`, padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                      <input aria-label="Public Trip" type="radio" name="visibility" value="public" checked={values.visibility === 'public'} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                      <div>
                        <h4 style={{ margin: 0 }}>Public</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Anyone can view and fork this itinerary.</p>
                      </div>
                    </label>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
              <button type="button" onClick={() => handleNavClick(-1, prevStep)} disabled={step === 1}
                style={{
                  padding: 'var(--space-2) var(--space-4)', background: 'transparent', color: 'var(--color-text)',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)',
                  opacity: step === 1 ? 0.3 : 1, cursor: step === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                <ChevronLeft size={18} /> Back
              </button>
              
              <button type="submit" onClick={() => setDirection(1)} disabled={!isStepValid()}
                style={{
                  padding: 'var(--space-2) var(--space-6)',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  color: 'white', border: 'none', borderRadius: 'var(--radius-full)', cursor: !isStepValid() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600,
                  opacity: !isStepValid() ? 0.5 : 1
                }}>
                {step === 4 ? 'Create Trip' : 'Next'} {step < 4 && <ChevronRight size={18} />}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateTrip;