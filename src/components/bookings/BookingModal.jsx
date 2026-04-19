import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, Plane, Calendar, MapPin, DollarSign, Link as LinkIcon, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, onSave, type, initialData = null }) => {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        amenities: initialData.amenities ? initialData.amenities.join(', ') : '',
        images: initialData.images ? initialData.images.join(', ') : ''
      });
    } else {
      if (type === 'hotel') {
        setForm({ type: 'hotel', name: '', address: '', checkIn: '', checkOut: '', roomType: '', cost: 0, currency: 'USD', amenities: '', bookingRef: '', link: '', images: '' });
      } else {
        setForm({ type: 'flight', airline: '', flightNumber: '', departureTime: '', arrivalTime: '', cost: 0, currency: 'USD', bookingRef: '', link: '' });
      }
    }
  }, [initialData, isOpen, type]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = { ...form };
    
    if (type === 'hotel') {
      dataToSave.amenities = form.amenities ? form.amenities.split(',').map(s => s.trim()) : [];
      dataToSave.images = form.images ? form.images.split(',').map(s => s.trim()) : [];
    }
    
    onSave(dataToSave);
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }} />
        
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="glass-panel responsive-modal" style={{ width: '100%', maxWidth: '600px', padding: 'var(--space-6)', position: 'relative', zIndex: 1001, maxHeight: '90vh', overflowY: 'auto' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
          
          <h2 style={{ margin: '0 0 var(--space-6) 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {type === 'hotel' ? <Building size={24} color="var(--color-primary)" /> : <Plane size={24} color="var(--color-secondary)" />}
            {initialData ? `Edit ${type === 'hotel' ? 'Hotel' : 'Flight'}` : `Add ${type === 'hotel' ? 'Hotel' : 'Flight'}`}
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            {type === 'hotel' ? (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Hotel Name</label>
                  <input type="text" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Address</label>
                  <input type="text" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} required />
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Check-in Date & Time</label>
                    <input type="datetime-local" value={form.checkIn || ''} onChange={e => setForm({...form, checkIn: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', colorScheme: 'dark' }} required />
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Check-out Date & Time</label>
                    <input type="datetime-local" value={form.checkOut || ''} onChange={e => setForm({...form, checkOut: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', colorScheme: 'dark' }} required />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Room Type</label>
                  <input type="text" value={form.roomType || ''} onChange={e => setForm({...form, roomType: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} placeholder="e.g. Deluxe Ocean View" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Amenities (comma separated)</label>
                  <input type="text" value={form.amenities || ''} onChange={e => setForm({...form, amenities: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} placeholder="e.g. WiFi, Pool, Breakfast Included" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Image URLs (comma separated)</label>
                  <input type="text" value={form.images || ''} onChange={e => setForm({...form, images: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} placeholder="https://example.com/hotel.jpg" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Airline</label>
                  <input type="text" value={form.airline || ''} onChange={e => setForm({...form, airline: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} required placeholder="e.g. Emirates" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Flight Number</label>
                  <input type="text" value={form.flightNumber || ''} onChange={e => setForm({...form, flightNumber: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} required placeholder="e.g. EK123" />
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Departure Date & Time</label>
                    <input type="datetime-local" value={form.departureTime || ''} onChange={e => setForm({...form, departureTime: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', colorScheme: 'dark' }} required />
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Arrival Date & Time</label>
                    <input type="datetime-local" value={form.arrivalTime || ''} onChange={e => setForm({...form, arrivalTime: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white', colorScheme: 'dark' }} required />
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Total Cost</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="number" value={form.cost || 0} onChange={e => setForm({...form, cost: Number(e.target.value)})} style={{ flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} />
                  <select value={form.currency || 'USD'} onChange={e => setForm({...form, currency: e.target.value})} style={{ width: '80px', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Booking Reference (PNR)</label>
                <input type="text" value={form.bookingRef || ''} onChange={e => setForm({...form, bookingRef: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} placeholder="e.g. ABC123X" />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Booking Link</label>
              <input type="url" value={form.link || ''} onChange={e => setForm({...form, link: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'white' }} placeholder="https://..." />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-primary)', border: 'none', borderRadius: '20px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>{initialData ? 'Save Changes' : `Add ${type === 'hotel' ? 'Hotel' : 'Flight'}`}</button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
