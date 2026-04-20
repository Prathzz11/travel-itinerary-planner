import React, { useState, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Calendar as CalendarIcon, Plus, Map as MapIcon, Search, Filter, Trash2, Edit2, ChevronDown, ChevronUp, DollarSign, User, Printer, CheckCircle, Circle, GripVertical } from 'lucide-react';
import { useTrip } from '../hooks/useTrip';
import { useDebounce } from '../hooks/useDebounce';
import { ItineraryContext } from '../contexts/ItineraryContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ACTIVITY_CATEGORIES } from '../utils/categoryConfig';
import TripNav from '../components/trip/TripNav';
import ActivityModal from '../components/itinerary/ActivityModal';
import InteractiveMap from '../components/map/InteractiveMap';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const CATEGORIES = ['All', 'Sightseeing', 'Dining', 'Transport', 'Accommodation', 'Shopping', 'Entertainment', 'Sports', 'Other'];

const Itinerary = () => {
  const { id } = useParams();
  const { trips } = useTrip();
  const { getItinerary, addActivity, updateActivity, deleteActivity, reorderActivities } = useContext(ItineraryContext);
  
  const trip = trips?.find(t => t.id === id);
  const itineraryDays = getItinerary(id);
  
  const [activeDay, setActiveDay] = useState(itineraryDays[0]?.id || 1);
  const [viewMode, setViewMode] = useLocalStorage('itinerary_viewMode', 'timeline');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [completedActivities, setCompletedActivities] = useLocalStorage('itinerary_completed', {});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const toggleComplete = (actId) => setCompletedActivities(prev => ({ ...prev, [actId]: !prev[actId] }));

  if (!trip) return <div className="page-container"><div className="card text-center py-5"><h2>Trip not found</h2></div></div>;

  const currentDay = itineraryDays.find(d => d.id === activeDay);

  const filteredActivities = useMemo(() => {
    if (!currentDay) return [];
    return currentDay.activities.filter(act => {
      const matchesSearch = act.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || act.location.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || act.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [currentDay, debouncedSearch, categoryFilter]);

  const handleSaveActivity = (data) => {
    if (editingActivity) updateActivity(id, activeDay, editingActivity.id, data);
    else addActivity(id, activeDay, data);
    setIsModalOpen(false);
    setEditingActivity(null);
  };

  const handleEdit = (e, act) => { e.stopPropagation(); setEditingActivity(act); setIsModalOpen(true); };
  const handleDelete = (e, actId) => { e.stopPropagation(); setConfirmDelete(actId); };
  const toggleExpand = (actId) => setExpandedActivity(prev => prev === actId ? null : actId);

  return (
    <div className="page-container animate-fade-in">
      <div className="card" style={{ minHeight: '80vh' }}>
        
        {/* Header */}
        <div className="card-header no-print">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 mb-0">{trip.title} - Itinerary</h2>
            <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={() => window.print()}><Printer size={16} /> Print</button>
          </div>
          <TripNav tripId={trip.id} />
        </div>

        <div className="d-flex flex-grow-1" style={{ overflow: 'hidden' }}>
          {/* Sidebar - Days */}
          {viewMode !== 'calendar' && (
            <div className="border-end d-none d-md-flex flex-column" style={{ width: 220, background: 'rgba(0,0,0,0.1)' }}>
              <div className="p-3 border-bottom"><h6 className="mb-0">Days</h6></div>
              <div className="flex-grow-1 overflow-auto">
                {itineraryDays.map(day => (
                  <div key={day.id} onClick={() => setActiveDay(day.id)} className="p-3" style={{ cursor: 'pointer', background: activeDay === day.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent', borderLeft: `3px solid ${activeDay === day.id ? 'var(--color-primary)' : 'transparent'}`, transition: 'all 0.2s' }}>
                    <div className="fw-semibold" style={{ color: activeDay === day.id ? 'var(--color-primary)' : 'inherit' }}>Day {day.day}</div>
                    <div className="text-muted small">{day.date}</div>
                    <div className="text-muted small mt-1">{day.activities.length} Activities</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-grow-1 d-flex flex-column overflow-hidden">
            {/* Toolbar */}
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3 no-print">
              <div className="btn-group btn-group-sm">
                <button className={`btn ${viewMode === 'timeline' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setViewMode('timeline')}>Timeline</button>
                <button className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setViewMode('calendar')}>Calendar</button>
                <button className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setViewMode('map')}>Map</button>
              </div>
              {viewMode === 'timeline' && (
                <div className="d-flex gap-2 flex-grow-1 justify-content-end">
                  <input type="text" className="form-control form-control-sm" style={{ maxWidth: 200 }} placeholder="Search activities..." value={search} onChange={e => setSearch(e.target.value)} />
                  <select className="form-select form-select-sm" style={{ maxWidth: 150 }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={() => { setEditingActivity(null); setIsModalOpen(true); }}><Plus size={16} /> Add</button>
                </div>
              )}
            </div>

            <div className="flex-grow-1 overflow-auto p-4">
              {/* TIMELINE VIEW */}
              {viewMode === 'timeline' && currentDay && (
                <div className="d-flex flex-column gap-3 position-relative">
                  {filteredActivities.length === 0 && (
                    <div className="mt-4">
                      <EmptyState icon={search || categoryFilter !== 'All' ? Search : CalendarIcon} title={search || categoryFilter !== 'All' ? "No activities found" : "No activities planned"} message={search || categoryFilter !== 'All' ? `No activities match your filters.` : "Add an activity to get started!"} actionLabel={search || categoryFilter !== 'All' ? "Clear Filters" : "Add Activity"} actionIcon={search || categoryFilter !== 'All' ? null : Plus} onAction={() => { if (search || categoryFilter !== 'All') { setSearch(''); setCategoryFilter('All'); } else { setEditingActivity(null); setIsModalOpen(true); }}} />
                    </div>
                  )}
                  
                  {filteredActivities.length > 0 && <div className="position-absolute" style={{ left: 88, top: 20, bottom: 20, width: 2, background: 'var(--color-border)' }} />}

                  {filteredActivities.map((act) => {
                    const isExpanded = expandedActivity === act.id;
                    return (
                      <div key={act.id} className="d-flex gap-3 position-relative animate-fade-in" style={{ zIndex: 1 }}>
                        <div style={{ width: 80, paddingTop: 8, textAlign: 'right' }}>
                          <div className="fw-semibold">{act.time}</div>
                          <div className="text-muted small">{act.duration}</div>
                        </div>
                        <div className="d-flex flex-column align-items-center pt-2"><div className="rounded-circle" style={{ width: 16, height: 16, background: 'var(--color-primary)', border: '4px solid var(--bs-body-bg)' }} /></div>
                        <div className="card flex-grow-1" onClick={() => toggleExpand(act.id)} style={{ cursor: 'pointer', borderColor: isExpanded ? 'var(--color-primary)' : undefined }}>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="d-flex gap-2 align-items-start">
                                <div title={act.category} className="rounded d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, background: ACTIVITY_CATEGORIES[act.category]?.bgColor || 'rgba(148,163,184,0.15)', fontSize: '1.1rem', flexShrink: 0 }}>
                                  {ACTIVITY_CATEGORIES[act.category]?.emoji || '📌'}
                                </div>
                                <div>
                                  <span className="badge small mb-1" style={{ background: ACTIVITY_CATEGORIES[act.category]?.bgColor, color: ACTIVITY_CATEGORIES[act.category]?.color }}>{act.category}</span>
                                  <h6 className="mb-1" style={{ textDecoration: completedActivities[act.id] ? 'line-through' : 'none', opacity: completedActivities[act.id] ? 0.5 : 1 }}>{act.title}</h6>
                                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.location)}`} target="_blank" rel="noreferrer" className="text-muted small text-decoration-none d-flex align-items-center gap-1" onClick={e => e.stopPropagation()}><MapPin size={12} /> {act.location}</a>
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <button className="btn btn-link p-0" onClick={e => { e.stopPropagation(); toggleComplete(act.id); }} style={{ color: completedActivities[act.id] ? 'var(--color-success)' : 'var(--color-text-muted)' }}>{completedActivities[act.id] ? <CheckCircle size={18} /> : <Circle size={18} />}</button>
                                <button className="btn btn-link p-0 text-muted" onClick={e => handleEdit(e, act)}><Edit2 size={14} /></button>
                                <button className="btn btn-link p-0 text-danger" onClick={e => handleDelete(e, act.id)}><Trash2 size={14} /></button>
                                {isExpanded ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-top animate-fade-in">
                                <div className="row g-3 mb-3">
                                  <div className="col-6 text-muted small d-flex align-items-center gap-1"><DollarSign size={14} color="var(--color-success)" /> Cost: {act.cost > 0 ? `${act.cost} ${act.currency}` : 'Free'}</div>
                                  <div className="col-6 text-muted small d-flex align-items-center gap-1"><User size={14} color="var(--color-secondary)" /> Added by: {act.creator}</div>
                                </div>
                                {act.notes && <div className="p-2 rounded-2 small mb-3" style={{ background: 'rgba(0,0,0,0.2)' }}><strong>Notes:</strong> <span className="text-muted">{act.notes}</span></div>}
                                {act.images?.length > 0 && <div className="d-flex gap-2 overflow-auto">{act.images.map((img, i) => <img key={i} src={img} alt="Activity" className="rounded" style={{ height: 80, width: 120, objectFit: 'cover' }} />)}</div>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CALENDAR VIEW */}
              {viewMode === 'calendar' && (
                <div className="row g-4">
                  {itineraryDays.map(day => (
                    <div key={day.id} className="col-md-4 col-lg-3">
                      <div className="card h-100">
                        <div className="card-header"><div className="fw-bold" style={{ color: 'var(--color-primary)' }}>Day {day.day}</div><div className="text-muted small">{day.date}</div></div>
                        <div className="card-body d-flex flex-column gap-2">
                          {day.activities.length > 0 ? day.activities.map(act => (
                            <div key={act.id} className="p-2 rounded-2 border-start border-3" style={{ background: 'rgba(0,0,0,0.2)', borderColor: 'var(--color-secondary)' }}>
                              <div className="text-muted" style={{ fontSize: '0.8rem' }}>{act.time}</div>
                              <div className="fw-semibold text-truncate" style={{ fontSize: '0.95rem' }}>{act.title}</div>
                            </div>
                          )) : <div className="text-muted small fst-italic">No activities planned.</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MAP VIEW */}
              {viewMode === 'map' && (
                <div className="rounded-3 overflow-hidden border" style={{ height: '100%', minHeight: 400 }}>
                  <InteractiveMap activities={filteredActivities} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ActivityModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingActivity(null); }} onSave={handleSaveActivity} initialData={editingActivity} />
      <ConfirmDialog isOpen={!!confirmDelete} title="Delete Activity?" message="This activity will be permanently removed." confirmLabel="Delete" onConfirm={() => { deleteActivity(id, activeDay, confirmDelete); setConfirmDelete(null); }} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
};

export default Itinerary;