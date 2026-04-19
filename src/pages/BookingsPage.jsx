import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Plane, Plus, MapPin, Calendar, ExternalLink, Hash, Clock, CheckCircle, Wifi, Edit2, Trash2 } from 'lucide-react';
import { useTrip } from '../hooks/useTrip';
import { BookingContext } from '../contexts/BookingContext';
import TripNav from '../components/trip/TripNav';
import BookingModal from '../components/bookings/BookingModal';
import EmptyState from '../components/ui/EmptyState';

const BookingsPage = () => {
  const { id } = useParams();
  const { trips } = useTrip();
  const { getBookings, addBooking, updateBooking, deleteBooking } = useContext(BookingContext);
  
  const trip = trips?.find(t => t.id === id);
  const bookings = getBookings(id);
  
  const [activeTab, setActiveTab] = useState('hotel'); // 'hotel' or 'flight'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  if (!trip) return <div className="page-container glass-panel"><h2 style={{textAlign: 'center', margin: 'auto'}}>Trip not found</h2></div>;

  const filteredBookings = bookings.filter(b => b.type === activeTab);

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSave = (data) => {
    if (editingBooking) {
      updateBooking(id, editingBooking.id, data);
    } else {
      addBooking(id, data);
    }
    setIsModalOpen(false);
    setEditingBooking(null);
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  const handleDelete = (bookingId) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      deleteBooking(id, bookingId);
    }
  };

  return (
    <div className="page-container" style={{ padding: 'var(--space-8)' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
        
        {/* Header */}
        <div style={{ padding: 'var(--space-6) var(--space-6) 0', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{trip.title} - Bookings & Logistics</h2>
            <button onClick={() => { setEditingBooking(null); setIsModalOpen(true); }} style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
              <Plus size={16} /> Add {activeTab === 'hotel' ? 'Hotel' : 'Flight'}
            </button>
          </div>
          <TripNav tripId={trip.id} />
        </div>

        {/* Tab Selection */}
        <div style={{ padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)' }}>
          <button 
            onClick={() => setActiveTab('hotel')}
            style={{ flex: 1, padding: 'var(--space-4)', background: activeTab === 'hotel' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${activeTab === 'hotel' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-lg)', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
            <Building size={32} color={activeTab === 'hotel' ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Hotels & Accommodation</span>
          </button>
          <button 
            onClick={() => setActiveTab('flight')}
            style={{ flex: 1, padding: 'var(--space-4)', background: activeTab === 'flight' ? 'rgba(192, 132, 252, 0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${activeTab === 'flight' ? 'var(--color-secondary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-lg)', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
            <Plane size={32} color={activeTab === 'flight' ? 'var(--color-secondary)' : 'var(--color-text-muted)'} />
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Flights & Transport</span>
          </button>
        </div>

        {/* Content List */}
        <div style={{ padding: '0 var(--space-6) var(--space-6)', flex: 1 }}>
          {filteredBookings.length === 0 ? (
            <EmptyState 
              icon={activeTab === 'hotel' ? Building : Plane}
              title={`No ${activeTab === 'hotel' ? 'hotels' : 'flights'} booked yet`}
              message={`Click the "Add ${activeTab === 'hotel' ? 'Hotel' : 'Flight'}" button to get started.`}
              actionLabel={`Add ${activeTab === 'hotel' ? 'Hotel' : 'Flight'}`}
              actionIcon={Plus}
              onAction={() => { setEditingBooking(null); setIsModalOpen(true); }}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-6)' }}>
              <AnimatePresence>
                {filteredBookings.map(booking => (
                  <motion.div 
                    key={booking.id} 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                  >
                    {activeTab === 'hotel' ? (
                      <>
                        {booking.images && booking.images.length > 0 && (
                          <div style={{ height: '150px', width: '100%', background: `url(${booking.images[0]}) center/cover` }} />
                        )}
                        <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ margin: '0 0 var(--space-2) 0', fontSize: '1.3rem' }}>{booking.name}</h3>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button onClick={() => handleEdit(booking)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(booking.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--space-4)' }}>
                            <MapPin size={14} /> {booking.address}
                          </div>

                          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: 'var(--space-4)' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Check-in</div>
                              <div style={{ fontWeight: 600 }}>{new Date(booking.checkIn).toLocaleDateString()}</div>
                              <div style={{ fontSize: '0.8rem' }}>{new Date(booking.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Check-out</div>
                              <div style={{ fontWeight: 600 }}>{new Date(booking.checkOut).toLocaleDateString()}</div>
                              <div style={{ fontSize: '0.8rem' }}>{new Date(booking.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--space-4)' }}>
                            <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--color-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                              {calculateNights(booking.checkIn, booking.checkOut)} Nights
                            </span>
                            {booking.roomType && (
                              <span style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                                {booking.roomType}
                              </span>
                            )}
                          </div>

                          {booking.amenities && booking.amenities.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 'var(--space-4)' }}>
                              {booking.amenities.map((amenity, i) => (
                                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                  <CheckCircle size={10} color="var(--color-success)" /> {amenity}
                                </span>
                              ))}
                            </div>
                          )}

                          <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{booking.cost} {booking.currency}</div>
                            {booking.bookingRef && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                <Hash size={14} /> Ref: {booking.bookingRef}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'rgba(192, 132, 252, 0.1)', padding: '12px', borderRadius: '12px' }}>
                              <Plane size={24} color="var(--color-secondary)" />
                            </div>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{booking.airline}</h3>
                              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Hash size={12} /> {booking.flightNumber}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => handleEdit(booking)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(booking.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{new Date(booking.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(booking.departureTime).toLocaleDateString()}</div>
                          </div>
                          
                          <div style={{ flex: 1, margin: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Direct</div>
                            <div style={{ width: '100%', height: '2px', background: 'var(--color-border)', position: 'relative' }}>
                              <Plane size={12} color="var(--color-secondary)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                            </div>
                          </div>

                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{new Date(booking.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(booking.arrivalTime).toLocaleDateString()}</div>
                          </div>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{booking.cost > 0 ? `${booking.cost} ${booking.currency}` : 'Price not set'}</div>
                          {booking.bookingRef && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                              <Hash size={14} /> Ref: {booking.bookingRef}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBooking(null); }}
        onSave={handleSave}
        type={activeTab}
        initialData={editingBooking}
      />
    </div>
  );
};

export default BookingsPage;
