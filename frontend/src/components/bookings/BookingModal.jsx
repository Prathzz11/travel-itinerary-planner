import React, { useState, useEffect } from 'react';
import { Building, Plane } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, onSave, type, initialData = null }) => {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        checkIn: initialData.checkIn ? new Date(initialData.checkIn).toISOString().slice(0, 16) : '',
        checkOut: initialData.checkOut ? new Date(initialData.checkOut).toISOString().slice(0, 16) : ''
      });
    } else {
      setForm({
        type: type,
        title: '',
        provider: '',
        checkIn: '',
        checkOut: '',
        amount: 0,
        currency: 'INR',
        confirmationNumber: '',
        attachmentUrl: '',
        notes: ''
      });
    }
  }, [initialData, isOpen, type]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
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
                <div className="mb-3">
                  <label className="form-label text-muted">
                    {type === 'hotel' ? 'Hotel Name' : 'Flight Title'} (e.g. {type === 'hotel' ? 'Hilton Manali' : 'IndiGo Delhi → Manali'})
                  </label>
                  <input type="text" className="form-control" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted">Provider ({type === 'hotel' ? 'Hotel Chain' : 'Airline'})</label>
                  <input type="text" className="form-control" value={form.provider || ''} onChange={e => setForm({...form, provider: e.target.value})} placeholder={type === 'hotel' ? 'e.g. Marriott' : 'e.g. IndiGo'} />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted">{type === 'flight' ? 'Departure' : 'Check-in'}</label>
                    <input type="datetime-local" className="form-control" value={form.checkIn || ''} onChange={e => setForm({...form, checkIn: e.target.value})} required style={{ colorScheme: 'dark' }} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">{type === 'flight' ? 'Arrival' : 'Check-out'}</label>
                    <input type="datetime-local" className="form-control" value={form.checkOut || ''} onChange={e => setForm({...form, checkOut: e.target.value})} required style={{ colorScheme: 'dark' }} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted">Notes {type === 'hotel' ? '/ Address' : '/ Seat Info'}</label>
                  <textarea className="form-control" rows="2" value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Any additional details..." />
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-muted">Total Cost</label>
                    <div className="input-group">
                      <input type="number" className="form-control" value={form.amount || 0} onChange={e => setForm({...form, amount: Number(e.target.value)})} />
                      <select className="form-select" style={{ maxWidth: 90 }} value={form.currency || 'INR'} onChange={e => setForm({...form, currency: e.target.value})}>
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                        <option value="AUD">AUD</option>
                        <option value="CAD">CAD</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted">Booking Reference / PNR</label>
                    <input type="text" className="form-control" value={form.confirmationNumber || ''} onChange={e => setForm({...form, confirmationNumber: e.target.value})} placeholder="e.g. ABC123X" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted">Booking Link or Attachment URL</label>
                  <input type="url" className="form-control" value={form.attachmentUrl || ''} onChange={e => setForm({...form, attachmentUrl: e.target.value})} placeholder="https://..." />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" form="bookingForm" className="btn btn-primary">
                {initialData ? 'Save Changes' : `Add ${type === 'hotel' ? 'Hotel' : 'Flight'}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingModal;
