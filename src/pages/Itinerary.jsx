import React, { useState, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
  const [viewMode, setViewMode] = useLocalStorage('itinerary_viewMode', 'timeline'); // 'timeline', 'calendar', 'map'
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [completedActivities, setCompletedActivities] = useLocalStorage('itinerary_completed', {});
  const [confirmDelete, setConfirmDelete] = useState(null); // stores actId to delete
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const toggleComplete = (actId) => {
    setCompletedActivities(prev => ({ ...prev, [actId]: !prev[actId] }));
  };

  if (!trip) return <div className="page-container glass-panel"><h2 style={{textAlign: 'center', margin: 'auto'}}>Trip not found</h2></div>;

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
    if (editingActivity) {
      updateActivity(id, activeDay, editingActivity.id, data);
    } else {
      addActivity(id, activeDay, data);
    }
    setIsModalOpen(false);
    setEditingActivity(null);
  };

  const handleEdit = (e, act) => {
    e.stopPropagation();
    setEditingActivity(act);
    setIsModalOpen(true);
  };

  const handleDelete = (e, actId) => {
    e.stopPropagation();
    setConfirmDelete(actId);
  };

  const toggleExpand = (actId) => {
    setExpandedActivity(prev => prev === actId ? null : actId);
  };

  const parseDurationMins = (durationStr) => {
    if (!durationStr) return 60;
    const match = durationStr.toString().toLowerCase().match(/([\d.]+)\s*(h|m)/);
    if (!match) return 60;
    const val = parseFloat(match[1]);
    const unit = match[2];
    return unit === 'h' ? val * 60 : val;
  };

  const addMinutes = (timeStr, mins) => {
    if (!timeStr) return "00:00";
    const [h, m] = timeStr.split(':').map(Number);
    const totalMins = (h || 0) * 60 + (m || 0) + mins;
    const newH = Math.floor(totalMins / 60) % 24;
    const newM = Math.floor(totalMins % 60);
    return `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
  };

  const handleReorder = (newOrder) => {
    // Prevent reordering if filters are active since that would mess up the original array
    if (search || categoryFilter !== 'All') return;
    
    // Recalculate times so they are contiguous based on the first activity's time
    if (newOrder.length > 0) {
      let currentTime = newOrder[0].time;
      newOrder = newOrder.map((act, index) => {
        if (index === 0) return act;
        
        const prevAct = newOrder[index - 1];
        const prevMins = parseDurationMins(prevAct.duration);
        currentTime = addMinutes(currentTime, prevMins);
        
        return { ...act, time: currentTime };
      });
    }

    reorderActivities(id, activeDay, newOrder);
  };

  return (
    <div className="page-container" style={{ padding: 'var(--space-8)' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh' }}>
        
        {/* Header */}
        <div className="no-print" style={{ padding: 'var(--space-6) var(--space-6) 0', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{trip.title} - Itinerary</h2>
            <button onClick={() => window.print()} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, border: '1px solid var(--color-border)', cursor: 'pointer' }}>
              <Printer size={16} /> Print Itinerary
            </button>
          </div>
          <TripNav tripId={trip.id} />
        </div>

        <div className="print-area" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div className="print-only" style={{ display: 'none', padding: 'var(--space-6)', paddingBottom: 0, width: '100%' }}>
            <h2>{trip.title} - Full Itinerary</h2>
            <p>Generated on {new Date().toLocaleDateString()}</p>
            <hr />
          </div>
          
          {/* Sidebar - Days (Only visible in Timeline or Map view) */}
          {viewMode !== 'calendar' && (
            <div className="hide-on-print" style={{ width: '250px', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)' }}>
              <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Days</h3>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {itineraryDays.map(day => (
                  <div 
                    key={day.id} 
                    onClick={() => setActiveDay(day.id)}
                    style={{ 
                      padding: 'var(--space-4)', 
                      cursor: 'pointer', 
                      background: activeDay === day.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                      borderLeft: `3px solid ${activeDay === day.id ? 'var(--color-primary)' : 'transparent'}`,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: activeDay === day.id ? 'var(--color-primary)' : 'var(--color-text)' }}>Day {day.day}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{day.date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-secondary)' }} />
                      {day.activities.length} Activities
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
            <div className="hide-on-print" style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-full)', padding: '4px' }}>
                <button onClick={() => setViewMode('timeline')} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', background: viewMode === 'timeline' ? 'var(--color-primary)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500, transition: '0.2s' }}>Timeline</button>
                <button onClick={() => setViewMode('calendar')} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', background: viewMode === 'calendar' ? 'var(--color-primary)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500, transition: '0.2s' }}>Calendar</button>
                <button onClick={() => setViewMode('map')} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', background: viewMode === 'map' ? 'var(--color-primary)' : 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500, transition: '0.2s' }}>Map</button>
              </div>

              {viewMode === 'timeline' && (
                <div style={{ display: 'flex', gap: 'var(--space-3)', flex: 1, justifyContent: 'flex-end' }}>
                  <div style={{ position: 'relative', width: '200px' }}>
                    <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Search activities..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: 'var(--radius-full)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', color: 'white' }} />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '8px 16px 8px 32px', borderRadius: 'var(--radius-full)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', color: 'white', appearance: 'none' }}>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <Filter size={14} color="var(--color-text-muted)" style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                  <button onClick={() => { setEditingActivity(null); setIsModalOpen(true); }} style={{ background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    <Plus size={16} /> Add Activity
                  </button>
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', position: 'relative' }}>
              
              {/* TIMELINE VIEW */}
              {viewMode === 'timeline' && currentDay && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', position: 'relative' }}>
                  {filteredActivities.length === 0 && (
                    <div style={{ marginTop: '2rem' }}>
                      <EmptyState 
                        icon={search || categoryFilter !== 'All' ? Search : CalendarIcon}
                        title={search || categoryFilter !== 'All' ? "No activities found" : "No activities planned"}
                        message={search || categoryFilter !== 'All' ? `No activities match "${search}" in category "${categoryFilter}".` : "Your itinerary for this day is empty. Add an activity to get started!"}
                        actionLabel={search || categoryFilter !== 'All' ? "Clear Filters" : "Add Activity"}
                        actionIcon={search || categoryFilter !== 'All' ? null : Plus}
                        onAction={() => { 
                          if (search || categoryFilter !== 'All') {
                            setSearch(''); setCategoryFilter('All'); 
                          } else {
                            setEditingActivity(null); setIsModalOpen(true);
                          }
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Timeline vertical line */}
                  {filteredActivities.length > 0 && <div style={{ position: 'absolute', left: '88px', top: '20px', bottom: '20px', width: '2px', background: 'var(--color-border)', zIndex: 0 }} />}

                  <Reorder.Group axis="y" values={filteredActivities} onReorder={handleReorder} style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <AnimatePresence>
                      {filteredActivities.map((act, index) => {
                        const isExpanded = expandedActivity === act.id;
                        // Determine if drag is allowed (disable during search/filter)
                        const canDrag = !search && categoryFilter === 'All';
                        return (
                          <Reorder.Item 
                            key={act.id} 
                            value={act}
                            dragListener={canDrag}
                            layout
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                            style={{ display: 'flex', gap: 'var(--space-4)', zIndex: 1, position: 'relative', cursor: canDrag ? 'grab' : 'default' }}
                            whileDrag={{ scale: 1.02, zIndex: 10, cursor: 'grabbing' }}
                          >
                            <div style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingTop: 'var(--space-2)' }}>
                              <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{act.time}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{act.duration}</div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '12px' }}>
                              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--color-primary)', border: '4px solid var(--color-bg)' }} />
                            </div>
                            
                            <motion.div 
                              layout
                              onClick={() => toggleExpand(act.id)}
                              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'border-color 0.2s', borderColor: isExpanded ? 'var(--color-primary)' : 'var(--color-border)', display: 'flex', flexDirection: 'column' }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                  {canDrag && (
                                    <div style={{ cursor: 'grab', color: 'var(--color-text-muted)', paddingTop: '10px' }} title="Drag to reorder" onClick={e => e.stopPropagation()}>
                                      <GripVertical size={18} />
                                    </div>
                                  )}
                                  {/* Category emoji badge */}
                                  <div title={act.category} style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '10px', background: ACTIVITY_CATEGORIES[act.category]?.bgColor || 'rgba(148,163,184,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', marginTop: '2px' }}>
                                    {ACTIVITY_CATEGORIES[act.category]?.emoji || '📌'}
                                  </div>
                                  <div>
                                    <div style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 'var(--radius-full)', background: ACTIVITY_CATEGORIES[act.category]?.bgColor || 'rgba(148,163,184,0.1)', color: ACTIVITY_CATEGORIES[act.category]?.color || '#94a3b8', fontSize: '0.72rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                                      {act.category}
                                    </div>
                                    <h4 style={{ margin: '0 0 var(--space-2) 0', fontSize: '1.1rem', textDecoration: completedActivities[act.id] ? 'line-through' : 'none', opacity: completedActivities[act.id] ? 0.5 : 1, transition: '0.2s' }}>{act.title}</h4>
                                    <a 
                                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.location)}`}
                                      target="_blank" 
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '0.88rem', textDecoration: 'none', transition: 'color 0.2s' }}
                                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                                      title="View on Google Maps"
                                    >
                                      <MapPin size={13} /> {act.location}
                                    </a>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                  <button
                                    aria-label={completedActivities[act.id] ? 'Mark as pending' : 'Mark as completed'}
                                    title={completedActivities[act.id] ? 'Mark pending' : 'Mark complete'}
                                    onClick={(e) => { e.stopPropagation(); toggleComplete(act.id); }}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: completedActivities[act.id] ? 'var(--color-success)' : 'var(--color-text-muted)', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                                  >
                                    {completedActivities[act.id] ? <CheckCircle size={18} /> : <Circle size={18} />}
                                  </button>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button aria-label="Edit activity" title="Edit activity" onClick={(e) => handleEdit(e, act)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}><Edit2 aria-hidden="true" size={16} /></button>
                                    <button aria-label="Delete activity" title="Delete activity" onClick={(e) => handleDelete(e, act.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '4px' }}><Trash2 aria-hidden="true" size={16} /></button>
                                  </div>
                                  {isExpanded ? <ChevronUp size={20} color="var(--color-text-muted)" /> : <ChevronDown size={20} color="var(--color-text-muted)" />}
                                </div>
                              </div>

                              {/* Expanded Content */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
                                  >
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                        <DollarSign size={16} color="var(--color-success)" /> Cost: {act.cost > 0 ? `${act.cost} ${act.currency}` : 'Free'}
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                        <User size={16} color="var(--color-secondary)" /> Added by: {act.creator}
                                      </div>
                                    </div>
                                    
                                    {act.notes && (
                                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', marginBottom: 'var(--space-4)' }}>
                                        <strong>Notes:</strong> <span style={{ color: 'var(--color-text-muted)' }}>{act.notes}</span>
                                      </div>
                                    )}

                                    {act.images && act.images.length > 0 && (
                                      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                                        {act.images.map((img, i) => (
                                          <img key={i} src={img} alt="Activity" style={{ height: '80px', width: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                                        ))}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          </Reorder.Item>
                        );
                      })}
                    </AnimatePresence>
                  </Reorder.Group>
                </div>
              )}

              {/* CALENDAR VIEW */}
              {viewMode === 'calendar' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
                  {itineraryDays.map(day => (
                    <div key={day.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Day {day.day}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{day.date}</div>
                      </div>
                      <div style={{ padding: 'var(--space-4)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {day.activities.length > 0 ? day.activities.map(act => (
                          <div key={act.id} style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-secondary)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>{act.time}</div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.title}</div>
                          </div>
                        )) : (
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>No activities planned.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MAP VIEW */}
              {viewMode === 'map' && (
                <div style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <InteractiveMap activities={filteredActivities} />
                </div>
              )}

            </div>
          </div>
        </div>
      </motion.div>

      <ActivityModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingActivity(null); }}
        onSave={handleSaveActivity}
        initialData={editingActivity}
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Activity?"
        message="This activity will be permanently removed from the itinerary."
        confirmLabel="Delete"
        onConfirm={() => { deleteActivity(id, activeDay, confirmDelete); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Itinerary;