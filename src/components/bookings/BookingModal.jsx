import React, { useState, useEffect } from 'react';
import { X, Building, Plane } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, onSave, type, initialData = null }) => {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialData, amenities: initialData.amenities ? initialData.amenities.join(', ') : '', images: initialData.images ? initialData.images.join(', ') : '' });
    } else {
      if (type === 'hotel') setForm({ type: 'hotel', name: '', address: '', checkIn: '', checkOut: '', roomType: '', cost: 0, currency: 'USD', amenities: '', bookingRef: '', link: '', images: '' });
      else setForm({ type: 'flight', airline: '', flightNumber: '', departureTime: '', arrivalTime: '', cost: 0, currency: 'USD', bookingRef: '', link: '' });
    }
  }, [initialData, isOpen, type]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = { ...form };
    if (type === 'hotel') { dataToSave.amenities = form.amenities ? form.amenities.split(',').map(s => s.trim()) : []; dataToSave.images = form.images ? form.images.split(',').map(s => s.trim()) : []; }
    onSave(dataToSave);
  };

  return (
    <>
      <div className="modal-backdrop show" style={{ backdropFilter: 'blur(4px)' }} onClick={onClose}></div>
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div className="modal-content animate-scale-in">
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center gap-2">
                {type === 'hotel' ? <Building size={20} color="var(--color-primary)" /> : <Plane size={20} color="var(--color-secondary)" />}
                {initialData ? `Edit ${type === 'hotel' ? 'Hotel' : 'Flight'}` : `Add ${type === 'hotel' ? 'Hotel' : 'Flight'}`}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <form id="bookingForm" onSubmit={handleSubmit}>
                {type === 'hotel' ? (
                  <>
                    <div className="mb-3"><label className="form-label text-muted">Hotel Name</label><input type="text" className="form-control" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                    <div className="mb-3"><label className="form-label text-muted">Address</label><input type="text" className="form-control" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} required /></div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6"><label className="form-label text-muted">Check-in</label><input type="datetime-local" className="form-control" value={form.checkIn || ''} onChange={e => setForm({...form, checkIn: e.target.value})} required style={{ colorScheme: 'dark' }} /></div>
                      <div className="col-md-6"><label className="form-label text-muted">Check-out</label><input type="datetime-local" className="form-control" value={form.checkOut || ''} onChange={e => setForm({...form, checkOut: e.target.value})} required style={{ colorScheme: 'dark' }} /></div>
                    </div>
                    <div className="mb-3"><label className="form-label text-muted">Room Type</label><input type="text" className="form-control" value={form.roomType || ''} onChange={e => setForm({...form, roomType: e.target.value})} placeholder="e.g. Deluxe Ocean View" /></div>
                    <div className="mb-3"><label className="form-label text-muted">Amenities (comma separated)</label><input type="text" className="form-control" value={form.amenities || ''} onChange={e => setForm({...form, amenities: e.target.value})} placeholder="e.g. WiFi, Pool, Breakfast" /></div>
                    <div className="mb-3"><label className="form-label text-muted">Image URLs (comma separated)</label><input type="text" className="form-control" value={form.images || ''} onChange={e => setForm({...form, images: e.target.value})} placeholder="https://example.com/hotel.jpg" /></div>
                  </>
                ) : (
                  <>
                    <div className="mb-3"><label className="form-label text-muted">Airline</label><input type="text" className="form-control" value={form.airline || ''} onChange={e => setForm({...form, airline: e.target.value})} required placeholder="e.g. Emirates" /></div>
                    <div className="mb-3"><label className="form-label text-muted">Flight Number</label><input type="text" className="form-control" value={form.flightNumber || ''} onChange={e => setForm({...form, flightNumber: e.target.value})} required placeholder="e.g. EK123" /></div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6"><label className="form-label text-muted">Departure</label><input type="datetime-local" className="form-control" value={form.departureTime || ''} onChange={e => setForm({...form, departureTime: e.target.value})} required style={{ colorScheme: 'dark' }} /></div>
                      <div className="col-md-6"><label className="form-label text-muted">Arrival</label><input type="datetime-local" className="form-control" value={form.arrivalTime || ''} onChange={e => setForm({...form, arrivalTime: e.target.value})} required style={{ colorScheme: 'dark' }} /></div>
                    </div>
                  </>
                )}
                <div className="row g-3 mb-3">
                  <div className="col-md-6"><label className="form-label text-muted">Total Cost</label><div className="input-group"><input type="number" className="form-control" value={form.cost || 0} onChange={e => setForm({...form, cost: Number(e.target.value)})} /><select className="form-select" style={{ maxWidth: 90 }} value={form.currency || 'USD'} onChange={e => setForm({...form, currency: e.target.value})}><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="JPY">JPY</option></select></div></div>
                  <div className="col-md-6"><label className="form-label text-muted">Booking Reference</label><input type="text" className="form-control" value={form.bookingRef || ''} onChange={e => setForm({...form, bookingRef: e.target.value})} placeholder="e.g. ABC123X" /></div>
                </div>
                <div className="mb-3"><label className="form-label text-muted">Booking Link</label><input type="url" className="form-control" value={form.link || ''} onChange={e => setForm({...form, link: e.target.value})} placeholder="https://..." /></div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" form="bookingForm" className="btn btn-primary">{initialData ? 'Save Changes' : `Add ${type === 'hotel' ? 'Hotel' : 'Flight'}`}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingModal;
