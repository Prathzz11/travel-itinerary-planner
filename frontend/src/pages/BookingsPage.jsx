import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Building, Plane, Plus, MapPin, Calendar, Hash, Clock, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { useTrip } from '../hooks/useTrip';
import { BookingContext } from '../contexts/BookingContext';
import TripNav from '../components/trip/TripNav';
import BookingModal from '../components/bookings/BookingModal';
import EmptyState from '../components/ui/EmptyState';

import { formatCurrency } from '../utils/formatters';

const BookingsPage = () => {
  const { id } = useParams();
  const { trips } = useTrip();
  const { getBookings, loadBookings, addBooking, updateBooking, deleteBooking } = useContext(BookingContext);
  const trip = trips?.find(t => (t._id || t.id) === id);
  const bookings = getBookings(id);

  const [activeTab, setActiveTab] = useState('hotel');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  useEffect(() => {
    if (id) loadBookings(id);
  }, [id, loadBookings]);

  if (!trip) return <div className="page-container"><div className="card text-center py-5"><h2>Trip not found</h2></div></div>;

  const filteredBookings = bookings.filter(b => b.type === activeTab);
  const calculateNights = (checkIn, checkOut) => Math.ceil(Math.abs(new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  const handleSave = (data) => { if (editingBooking) updateBooking(id, editingBooking.id, data); else addBooking(id, data); setIsModalOpen(false); setEditingBooking(null); };
  const handleDelete = (bookingId) => { if (window.confirm("Delete this booking?")) deleteBooking(id, bookingId); };

  return (
    <div className="page-container animate-fade-in">
      <div className="card" style={{ minHeight: '80vh' }}>
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 mb-0">{trip.title} - Bookings</h2>
            <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={() => { setEditingBooking(null); setIsModalOpen(true); }}><Plus size={16} /> Add {activeTab === 'hotel' ? 'Hotel' : 'Flight'}</button>
          </div>
          <TripNav tripId={trip._id || trip.id} />
        </div>
        <div className="card-body">
          {/* Tabs */}
          <div className="row g-3 mb-4">
            <div className="col-6"><button className={`btn w-100 d-flex flex-column align-items-center gap-2 py-3 ${activeTab === 'hotel' ? 'btn-outline-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('hotel')}><Building size={28} /><span className="fw-semibold">Hotels & Accommodation</span></button></div>
            <div className="col-6"><button className={`btn w-100 d-flex flex-column align-items-center gap-2 py-3 ${activeTab === 'flight' ? 'btn-outline-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('flight')}><Plane size={28} /><span className="fw-semibold">Flights & Transport</span></button></div>
          </div>

          {filteredBookings.length === 0 ? (
            <EmptyState icon={activeTab === 'hotel' ? Building : Plane} title={`No ${activeTab === 'hotel' ? 'hotels' : 'flights'} booked`} message={`Click "Add ${activeTab === 'hotel' ? 'Hotel' : 'Flight'}" to get started.`} actionLabel={`Add ${activeTab === 'hotel' ? 'Hotel' : 'Flight'}`} actionIcon={Plus} onAction={() => { setEditingBooking(null); setIsModalOpen(true); }} />
          ) : (
            <div className="row g-4">
              {filteredBookings.map(booking => (
                <div key={booking.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 animate-fade-in">
                    {activeTab === 'hotel' ? (
                      <>
                        {booking.images?.length > 0 && <div style={{ height: 150, background: `url(${booking.images[0]}) center/cover` }} />}
                        <div className="card-body d-flex flex-column">
                          <div className="d-flex justify-content-between mb-2"><h6 className="fw-bold mb-0">{booking.title}</h6><div className="d-flex gap-1"><button className="btn btn-link p-0 text-muted" onClick={() => { setEditingBooking(booking); setIsModalOpen(true); }}><Edit2 size={14} /></button><button className="btn btn-link p-0 text-danger" onClick={() => handleDelete(booking._id || booking.id)}><Trash2 size={14} /></button></div></div>
                          <div className="text-muted small d-flex align-items-center gap-1 mb-3"><MapPin size={12} /> {booking.provider}</div>
                          <div className="row g-2 mb-3 p-2 rounded-2" style={{ background: 'rgba(0,0,0,0.15)' }}>
                            <div className="col-6"><div className="text-muted" style={{ fontSize: '0.7rem' }}>Check-in</div><div className="fw-semibold small">{new Date(booking.checkIn).toLocaleDateString()}</div></div>
                            <div className="col-6"><div className="text-muted" style={{ fontSize: '0.7rem' }}>Check-out</div><div className="fw-semibold small">{new Date(booking.checkOut).toLocaleDateString()}</div></div>
                          </div>
                          <div className="d-flex flex-wrap gap-1 mb-3">
                            <span className="badge bg-primary">{calculateNights(booking.checkIn, booking.checkOut)} Nights</span>
                          </div>
                          {booking.notes && <div className="text-muted small mb-3 text-truncate-3">{booking.notes}</div>}
                          <div className="mt-auto pt-3 border-top d-flex justify-content-between"><span className="fw-bold">{formatCurrency ? formatCurrency(booking.amount) : `${booking.amount} ${booking.currency}`}</span>{booking.confirmationNumber && <span className="text-muted small"><Hash size={12} /> {booking.confirmationNumber}</span>}</div>
                        </div>
                      </>
                    ) : (
                        <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between mb-3">
                          <div className="d-flex align-items-center gap-3"><div className="p-2 rounded-3" style={{ background: 'rgba(192,132,252,0.1)' }}><Plane size={24} color="var(--color-secondary)" /></div><div><h6 className="mb-0">{booking.title}</h6><div className="text-muted small">{booking.provider}</div></div></div>
                          <div className="d-flex gap-1"><button className="btn btn-link p-0 text-muted" onClick={() => { setEditingBooking(booking); setIsModalOpen(true); }}><Edit2 size={14} /></button><button className="btn btn-link p-0 text-danger" onClick={() => handleDelete(booking._id || booking.id)}><Trash2 size={14} /></button></div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between p-3 rounded-2 mb-3" style={{ background: 'rgba(0,0,0,0.15)' }}>
                          <div className="text-center"><div className="fw-bold">{new Date(booking.checkIn).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div><div className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(booking.checkIn).toLocaleDateString()}</div></div>
                          <div className="flex-grow-1 mx-3 text-center"><div className="text-muted" style={{ fontSize: '0.7rem' }}>Direct</div><div style={{ height: 2, background: 'var(--color-border)', position: 'relative' }}><Plane size={12} color="var(--color-secondary)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} /></div></div>
                          <div className="text-center"><div className="fw-bold">{new Date(booking.checkOut).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div><div className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(booking.checkOut).toLocaleDateString()}</div></div>
                        </div>
                        <div className="mt-auto pt-3 border-top d-flex justify-content-between"><span className="fw-bold">{booking.amount > 0 ? (formatCurrency ? formatCurrency(booking.amount) : `${booking.amount} ${booking.currency}`) : 'Price not set'}</span>{booking.confirmationNumber && <span className="text-muted small"><Hash size={12} /> {booking.confirmationNumber}</span>}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BookingModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingBooking(null); }} onSave={handleSave} type={activeTab} initialData={editingBooking} />
    </div>
  );
};

export default BookingsPage;
