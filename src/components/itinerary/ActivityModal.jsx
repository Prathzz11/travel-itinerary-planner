import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, DollarSign, Image as ImageIcon, Tag, FileText } from 'lucide-react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { SocketContext } from '../../contexts/SocketContext';
import { useParams } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const CATEGORIES = ['Sightseeing', 'Dining', 'Transport', 'Accommodation', 'Shopping', 'Entertainment', 'Sports', 'Other'];

const ActivityModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const { id: tripId } = useParams();
  const socketContext = useContext(SocketContext);
  const { emitTyping, emitStopTyping } = socketContext || {};
  const typingTimeoutRef = useRef(null);

  const defaultForm = {
    title: '', time: '09:00', duration: '1h', category: 'Sightseeing', 
    location: '', lat: null, lng: null, cost: 0, currency: 'USD', notes: '', images: ''
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

  const handleTyping = () => {
    if (emitTyping && tripId) {
      emitTyping(tripId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (emitStopTyping) emitStopTyping(tripId);
      }, 2000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      images: form.images ? form.images.split(',').map(s => s.trim()) : []
    });
    // Clear draft only if it was a new creation, or just clear it regardless on save
    if (!initialData) {
      setForm(defaultForm);
      localStorage.removeItem('activity_draft');
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }} />
        
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="glass-panel responsive-modal" style={{ width: '100%', maxWidth: '600px', padding: 'var(--space-6)', position: 'relative', zIndex: 1001, maxHeight: '90vh', overflowY: 'auto' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
          
          <h2 style={{ margin: '0 0 var(--space-6) 0' }}>{initialData ? 'Edit Activity' : 'Add Activity'}</h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Activity Name</label>
              <input type="text" value={form.title} onKeyDown={handleTyping} onChange={e => setForm({...form, title: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} required placeholder="e.g. Visit Eiffel Tower" />
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><Tag size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }}>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Time</label>
                <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', colorScheme: 'dark' }} required />
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Duration</label>
                <input type="text" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} placeholder="e.g. 2h 30m" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Location</label>
              {isLoaded ? (
                <Autocomplete
                  onLoad={autoC => autocompleteRef.current = autoC}
                  onPlaceChanged={handlePlaceChanged}
                >
                  <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} placeholder="Address or Place name" />
                </Autocomplete>
              ) : (
                <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} placeholder="Address or Place name" />
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><DollarSign size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Cost</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" value={form.cost} onChange={e => setForm({...form, cost: Number(e.target.value)})} style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} />
                <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} style={{ width: '80px', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><FileText size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Notes & Description</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', minHeight: '80px' }} placeholder="Important details, booking references, etc." />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}><ImageIcon size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> Image URLs (comma separated)</label>
              <input type="text" value={form.images} onChange={e => setForm({...form, images: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} placeholder="https://example.com/image.jpg" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-primary)', border: 'none', borderRadius: '20px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>{initialData ? 'Save Changes' : 'Add Activity'}</button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ActivityModal;
