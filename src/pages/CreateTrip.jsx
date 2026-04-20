import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, IndianRupee, Users, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
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

  const validate = useCallback((vals) => {
    const errs = {};
    if (!vals.title?.trim()) errs.title = 'Title is required';
    if (!vals.destination?.trim()) errs.destination = 'Destination is required';
    if (!vals.startDate) errs.startDate = 'Start date is required';
    if (!vals.endDate) errs.endDate = 'End date is required';
    if (vals.startDate && vals.endDate && new Date(vals.startDate) > new Date(vals.endDate)) errs.endDate = 'End date must be after start date';
    if (!vals.budget || Number(vals.budget) <= 0) errs.budget = 'Budget must be > 0';
    return errs;
  }, []);

  const { values, errors, touched, handleChange, handleBlur, clearDraft } = useForm({
    initialValues: { title: '', destination: '', startDate: '', endDate: '', budget: '', currency: 'INR', visibility: 'private' },
    draftKey: 'create_trip_draft',
    validate,
    onSubmit: () => {}
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  useEffect(() => {
    if (pendingNavigateId.current) {
      const found = trips?.find(t => t.id === pendingNavigateId.current);
      if (found) { const id = pendingNavigateId.current; pendingNavigateId.current = null; navigate(`/trip/${id}`, { state: { autoEdit: true } }); }
    }
  }, [trips, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 4) { nextStep(); return; }
    const newId = Math.random().toString(36).substr(2, 9);
    const creator = user
      ? { id: user.id || 'm_creator', name: user.name, email: user.email, role: 'admin', joinedAt: new Date().toISOString(), avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`, online: true }
      : { id: 'm_creator', name: 'You', email: '', role: 'admin', joinedAt: new Date().toISOString(), avatar: 'https://i.pravatar.cc/150?u=creator', online: true };
    const newTrip = {
      id: newId, ...values, budget: Number(values.budget), spent: 0,
      image: `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80`,
      members: [creator], status: 'planning', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      activitiesCount: 0, activityFeed: [{ id: `af_${Date.now()}`, user: creator.name, action: 'created the trip', timestamp: new Date().toISOString() }]
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

  return (
    <div className="page-container d-flex align-items-center justify-content-center">
      <div style={{ width: '100%', maxWidth: '600px' }}>
        
        {/* Progress Steps */}
        <div className="d-flex justify-content-between mb-5 position-relative">
          <div className="position-absolute top-50 start-0 end-0" style={{ height: 2, background: 'var(--color-border)', transform: 'translateY(-50%)' }} />
          <div className="position-absolute top-50 start-0" style={{ height: 2, background: 'var(--color-primary)', transform: 'translateY(-50%)', width: `${((step - 1) / 3) * 100}%`, transition: 'width 0.3s ease' }} />
          
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="rounded-circle d-flex align-items-center justify-content-center fw-semibold position-relative" style={{
              width: 40, height: 40, zIndex: 1,
              background: step >= num ? 'var(--color-primary)' : 'var(--bs-body-bg)',
              border: `2px solid ${step >= num ? 'var(--color-primary)' : 'var(--color-border)'}`,
              color: step >= num ? '#fff' : 'var(--color-text-muted)',
              transition: 'all 0.3s ease'
            }}>
              {step > num ? <CheckCircle size={20} /> : num}
            </div>
          ))}
        </div>

        {/* Wizard Card */}
        <div className="card animate-fade-in" style={{ minHeight: 400 }}>
          <div className="card-body p-4 p-md-5 d-flex flex-column">
            <form onSubmit={handleSubmit} className="flex-grow-1 d-flex flex-column">
              
              {step === 1 && (
                <div className="flex-grow-1 d-flex flex-column gap-4 animate-slide-left">
                  <div className="text-center">
                    <MapPin size={40} color="var(--color-primary)" className="mb-2" />
                    <h2 className="fs-3 fw-bold mb-1">Where are you going?</h2>
                    <p className="text-muted">Give your trip a name and destination.</p>
                  </div>
                  <div className="mb-3">
                    <input type="text" name="title" className={`form-control ${touched.title && errors.title ? 'is-invalid' : ''}`} placeholder="Trip Title (e.g., Summer in Paris)" value={values.title} onChange={handleChange} onBlur={handleBlur} required />
                    {touched.title && errors.title && <div className="invalid-feedback">{errors.title}</div>}
                  </div>
                  <div className="mb-3">
                    <input type="text" name="destination" className={`form-control ${touched.destination && errors.destination ? 'is-invalid' : ''}`} placeholder="Destination City/Country" value={values.destination} onChange={handleChange} onBlur={handleBlur} required />
                    {touched.destination && errors.destination && <div className="invalid-feedback">{errors.destination}</div>}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex-grow-1 d-flex flex-column gap-4 animate-slide-left">
                  <div className="text-center">
                    <Calendar size={40} color="var(--color-secondary)" className="mb-2" />
                    <h2 className="fs-3 fw-bold mb-1">When is your trip?</h2>
                    <p className="text-muted">Select your travel dates.</p>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted">Start Date</label>
                      <input type="date" name="startDate" className={`form-control ${touched.startDate && errors.startDate ? 'is-invalid' : ''}`} value={values.startDate} onChange={handleChange} onBlur={handleBlur} required style={{ colorScheme: 'dark' }} />
                      {touched.startDate && errors.startDate && <div className="invalid-feedback">{errors.startDate}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted">End Date</label>
                      <input type="date" name="endDate" className={`form-control ${touched.endDate && errors.endDate ? 'is-invalid' : ''}`} value={values.endDate} onChange={handleChange} onBlur={handleBlur} required style={{ colorScheme: 'dark' }} />
                      {touched.endDate && errors.endDate && <div className="invalid-feedback">{errors.endDate}</div>}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex-grow-1 d-flex flex-column gap-4 animate-slide-left">
                  <div className="text-center">
                    <IndianRupee size={40} color="var(--color-success)" className="mb-2" />
                    <h2 className="fs-3 fw-bold mb-1">Set a Budget</h2>
                    <p className="text-muted">How much are you planning to spend?</p>
                  </div>
                  <div className="row g-3">
                    <div className="col-8">
                      <input type="number" name="budget" className={`form-control ${touched.budget && errors.budget ? 'is-invalid' : ''}`} placeholder="Estimated Budget" value={values.budget} onChange={handleChange} onBlur={handleBlur} min="0" required />
                      {touched.budget && errors.budget && <div className="invalid-feedback">{errors.budget}</div>}
                    </div>
                    <div className="col-4">
                      <select name="currency" className="form-select" value={values.currency} onChange={handleChange}>
                        <option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option><option value="AUD">AUD ($)</option><option value="CAD">CAD ($)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="flex-grow-1 d-flex flex-column gap-4 animate-slide-left">
                  <div className="text-center">
                    <Users size={40} color="var(--color-accent)" className="mb-2" />
                    <h2 className="fs-3 fw-bold mb-1">Trip Privacy</h2>
                    <p className="text-muted">Who can see this itinerary?</p>
                  </div>
                  <div className="d-flex flex-column gap-3">
                    <label className={`d-flex align-items-center gap-3 p-3 rounded-3 border ${values.visibility === 'private' ? 'border-primary' : ''}`} style={{ cursor: 'pointer', background: 'rgba(15,23,42,0.5)' }}>
                      <input type="radio" name="visibility" value="private" className="form-check-input" checked={values.visibility === 'private'} onChange={handleChange} />
                      <div><h6 className="mb-0">Private</h6><small className="text-muted">Only you and invited members.</small></div>
                    </label>
                    <label className={`d-flex align-items-center gap-3 p-3 rounded-3 border ${values.visibility === 'public' ? 'border-primary' : ''}`} style={{ cursor: 'pointer', background: 'rgba(15,23,42,0.5)' }}>
                      <input type="radio" name="visibility" value="public" className="form-check-input" checked={values.visibility === 'public'} onChange={handleChange} />
                      <div><h6 className="mb-0">Public</h6><small className="text-muted">Anyone can view and fork this itinerary.</small></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="d-flex justify-content-between mt-auto pt-4 border-top">
                <button type="button" className="btn btn-outline-secondary d-flex align-items-center gap-1" onClick={prevStep} disabled={step === 1}>
                  <ChevronLeft size={18} /> Back
                </button>
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-1" disabled={!isStepValid()}>
                  {step === 4 ? 'Create Trip' : 'Next'} {step < 4 && <ChevronRight size={18} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;