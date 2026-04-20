import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, MapPin, IndianRupee, Image as ImageIcon, Tag, FileText } from 'lucide-react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { useParams } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const CATEGORIES = ['Sightseeing', 'Dining', 'Transport', 'Accommodation', 'Shopping', 'Entertainment', 'Sports', 'Other'];

const ActivityModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const { id: tripId } = useParams();

  const defaultForm = {
    title: '', time: '09:00', duration: '1h', category: 'Sightseeing', 
    location: '', lat: null, lng: null, cost: 0, currency: 'INR', notes: '', images: ''
  };

  const [form, setForm] = useLocalStorage('activity_draft', defaultForm);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const autocompleteRef = useRef(null);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry && place.geometry.location) {
        setForm({
          ...form,
          location: place.formatted_address || place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      }
    }
  };

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        images: initialData.images ? initialData.images.join(', ') : ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      images: form.images ? form.images.split(',').map(s => s.trim()) : []
    });
    if (!initialData) {
      setForm(defaultForm);
      localStorage.removeItem('activity_draft');
    }
  };

  return (
    <>
      <div className="modal-backdrop show" style={{ backdropFilter: 'blur(4px)' }} onClick={onClose}></div>
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div className="modal-content animate-scale-in">
            <div className="modal-header">
              <h5 className="modal-title">{initialData ? 'Edit Activity' : 'Add Activity'}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form id="activityForm" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-muted">Activity Name</label>
                  <input type="text" className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Visit Eiffel Tower" />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label text-muted"><Tag size={14} className="me-1" />Category</label>
                    <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted"><Clock size={14} className="me-1" />Time</label>
                    <input type="time" className="form-control" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required style={{ colorScheme: 'dark' }} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted">Duration</label>
                    <input type="text" className="form-control" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="e.g. 2h 30m" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted"><MapPin size={14} className="me-1" />Location</label>
                  {isLoaded ? (
                    <Autocomplete onLoad={autoC => autocompleteRef.current = autoC} onPlaceChanged={handlePlaceChanged}>
                      <input type="text" className="form-control" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Address or Place name" />
                    </Autocomplete>
                  ) : (
                    <input type="text" className="form-control" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Address or Place name" />
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted"><IndianRupee size={14} className="me-1" />Cost</label>
                  <div className="input-group">
                    <input type="number" className="form-control" value={form.cost} onChange={e => setForm({...form, cost: Number(e.target.value)})} />
                    <select className="form-select" style={{ maxWidth: 90 }} value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                      <option value="INR">INR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="JPY">JPY</option><option value="AUD">AUD</option><option value="CAD">CAD</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted"><FileText size={14} className="me-1" />Notes</label>
                  <textarea className="form-control" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows="3" placeholder="Important details, booking references..." />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted"><ImageIcon size={14} className="me-1" />Image URLs (comma separated)</label>
                  <input type="text" className="form-control" value={form.images} onChange={e => setForm({...form, images: e.target.value})} placeholder="https://example.com/image.jpg" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" form="activityForm" className="btn btn-primary">{initialData ? 'Save Changes' : 'Add Activity'}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityModal;
