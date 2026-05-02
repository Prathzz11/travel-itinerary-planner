import React, { useState, useRef } from 'react';
import { Upload, FileJson, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';
import Papa from 'papaparse';
import { useTrip } from '../../hooks/useTrip';

const ImportTripModal = ({ onClose }) => {
  const { importTrip } = useTrip();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setPreview(null);

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (ext === 'json') {
          const parsed = JSON.parse(event.target.result);
          validateAndSetPreview(parsed);
        } else if (ext === 'csv') {
          Papa.parse(event.target.result, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const parsed = transformCSVtoTrip(results.data);
              validateAndSetPreview(parsed);
            },
            error: (err) => {
              setError('Failed to parse CSV file: ' + err.message);
            }
          });
        } else {
          setError('Unsupported file format. Please upload .json or .csv');
        }
      } catch (err) {
        setError('Error processing file: ' + err.message);
      }
    };
    
    reader.readAsText(selectedFile);
  };

  const transformCSVtoTrip = (data) => {
    // Basic CSV mapping logic
    // Expected CSV Headers: title, destination, startDate, endDate, budget, currency (on row 1 for trip details)
    // Activity Headers: dayDate, time, activityTitle, location, category, cost, notes
    
    if (data.length === 0) throw new Error("CSV file is empty");

    // Extract trip metadata from the first row (assuming it repeats or is at least present in row 1)
    const tripDetails = {
      title: data[0].title || 'Imported Trip',
      destination: data[0].destination || 'Unknown Destination',
      startDate: data[0].startDate || new Date().toISOString().split('T')[0],
      endDate: data[0].endDate || new Date().toISOString().split('T')[0],
      budget: parseFloat(data[0].budget) || 0,
      currency: data[0].currency || 'INR'
    };

    // Group activities by date
    const daysMap = {};
    
    data.forEach(row => {
      if (!row.dayDate || !row.activityTitle) return; // Skip invalid rows
      
      if (!daysMap[row.dayDate]) {
        daysMap[row.dayDate] = [];
      }
      
      daysMap[row.dayDate].push({
        name: row.activityTitle,
        time: row.time || '',
        category: row.category || 'Other',
        location: row.location || '',
        cost: parseFloat(row.cost) || 0,
        notes: row.notes || ''
      });
    });

    const days = Object.keys(daysMap).sort().map(date => ({
      date,
      activities: daysMap[date]
    }));

    return { ...tripDetails, days };
  };

  const validateAndSetPreview = (data) => {
    if (!data.title || !data.destination) {
      throw new Error("Missing required trip fields (title, destination)");
    }
    
    const activityCount = data.days?.reduce((acc, day) => acc + (day.activities?.length || 0), 0) || 0;

    setPreview({
      ...data,
      totalDays: data.days?.length || 0,
      totalActivities: activityCount
    });
  };

  const handleImport = async () => {
    if (!preview) return;
    
    setLoading(true);
    try {
      await importTrip(preview);
      onClose();
    } catch (err) {
      setError(err.userMessage || 'Failed to import trip to database');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Frosted-glass full-screen overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 1050,
          background: 'rgba(5, 10, 24, 0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn 0.18s ease',
        }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div style={{
          width: '100%', maxWidth: 480,
          background: 'linear-gradient(135deg, rgba(22,33,62,0.95) 0%, rgba(15,23,42,0.98) 100%)',
          border: '1px solid rgba(56,189,248,0.18)',
          borderRadius: '1.25rem',
          boxShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(56,189,248,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
          overflow: 'hidden',
          animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          {/* Fake modal-content shell for the inner content */}
          <div className="modal-content" style={{ background: 'transparent', border: 'none', borderRadius: 0 }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(90deg, rgba(56,189,248,0.08) 0%, transparent 100%)',
              borderBottom: '1px solid rgba(56,189,248,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '0.6rem',
                  background: 'rgba(56,189,248,0.15)',
                  border: '1px solid rgba(56,189,248,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(56,189,248,0.2)'
                }}>
                  <Upload size={18} color="#38bdf8" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' }}>Import Itinerary</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.8)' }}>Upload a JSON or CSV file</div>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(148,163,184,0.2)',
                  background: 'rgba(148,163,184,0.08)', cursor: 'pointer', color: '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                  transition: 'all 0.15s', lineHeight: 1
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.08)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.2)'; }}
                aria-label="Close"
              >✕</button>
            </div>

            <div className="modal-body p-4">
              {!preview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    textAlign: 'center', padding: '2.5rem 1.5rem',
                    borderRadius: '0.875rem', cursor: 'pointer',
                    background: 'rgba(56,189,248,0.04)',
                    border: '1.5px dashed rgba(56,189,248,0.25)',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.08)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.5)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.04)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.25)'; }}
                >
                   <input
                    type="file"
                    accept=".json,.csv"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <div style={{
                    width: 64, height: 64, borderRadius: '1rem', margin: '0 auto 1rem',
                    background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 24px rgba(56,189,248,0.15)'
                  }}>
                    <FileJson size={30} color="#38bdf8" />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.975rem', color: '#f1f5f9', marginBottom: '0.4rem' }}>Click to upload</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>Drag & drop or browse your files</div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    {['.json', '.csv'].map(fmt => (
                      <span key={fmt} style={{
                        padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600,
                        background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8'
                      }}>{fmt}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="preview-section animate-fade-in">
                  <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-4">
                    <CheckCircle size={18} />
                    <span>File parsed successfully! Review details below.</span>
                  </div>

                  <div className="card border-secondary mb-3">
                    <div className="card-body p-3">
                      <h6 className="mb-3">Trip Summary</h6>
                      <div className="row g-2 small">
                        <div className="col-6"><span className="text-muted">Title:</span> {preview.title}</div>
                        <div className="col-6"><span className="text-muted">Destination:</span> {preview.destination}</div>
                        <div className="col-6"><span className="text-muted">Start:</span> {preview.startDate}</div>
                        <div className="col-6"><span className="text-muted">End:</span> {preview.endDate}</div>
                        <div className="col-6"><span className="text-muted">Budget:</span> {preview.budget} {preview.currency}</div>
                      </div>
                    </div>
                  </div>

                  <div className="card border-secondary">
                    <div className="card-body p-3 text-center">
                      <h6 className="mb-2">Itinerary Data Found</h6>
                      <div className="d-flex justify-content-around mt-3">
                        <div>
                          <div className="h4 mb-0 text-primary">{preview.totalDays}</div>
                          <div className="text-muted small">Days</div>
                        </div>
                        <div>
                          <div className="h4 mb-0" style={{ color: 'var(--color-secondary)' }}>{preview.totalActivities}</div>
                          <div className="text-muted small">Activities</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mt-3 mb-0 small">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid rgba(56,189,248,0.1)',
              display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
              background: 'rgba(0,0,0,0.15)'
            }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '0.5rem 1.1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500,
                  border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(148,163,184,0.08)',
                  color: '#94a3b8', cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(148,163,184,0.15)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(148,163,184,0.08)'}
              >Cancel</button>
              {preview && (
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1.25rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600,
                    border: '1px solid rgba(56,189,248,0.4)',
                    background: 'linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(99,102,241,0.2) 100%)',
                    color: '#38bdf8', cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.15s',
                    boxShadow: '0 0 16px rgba(56,189,248,0.15)'
                  }}
                  onMouseOver={e => !loading && (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56,189,248,0.3) 0%, rgba(99,102,241,0.3) 100%)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(99,102,241,0.2) 100%)')}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Importing...</>
                  ) : (
                    <><Upload size={15} /> Import to TravelSync</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImportTripModal;
