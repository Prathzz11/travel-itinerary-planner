import { useId, useRef, useState } from 'react';

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function TripPhotoField({ value = '', onChange, onBusyChange, disabled = false }) {
  const id = useId();
  const fileInput = useRef(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [failedUrl, setFailedUrl] = useState('');
  const isUpload = value.startsWith('data:');
  const change = next => { setError(''); setFailedUrl(''); onChange(next); };
  const upload = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!TYPES.includes(file.type)) { setError('Choose a JPG, PNG or WebP photo.'); return; }
    if (file.size > MAX_BYTES) { setError('Choose a photo smaller than 2 MB.'); return; }
    setBusy(true); onBusyChange?.(true); setError('');
    try {
      const data = await new Promise((resolve,reject)=>{const reader = new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Could not read this photo.'));reader.readAsDataURL(file);});
      await new Promise((resolve,reject)=>{const img = new Image();img.onload=resolve;img.onerror=()=>reject(new Error('This file could not be opened as a photo.'));img.src=data;});
      change(data);
    } catch(err) { setError(err.message); }
    finally { setBusy(false); onBusyChange?.(false); }
  };
  return <fieldset className="mb-3" disabled={disabled || busy}>
    <legend className="fs-6 mb-2">Trip photo <span className="text-muted small">(optional)</span></legend>
    {value && value !== failedUrl && <img src={value} alt="Trip photo preview" onError={()=>setFailedUrl(value)} className="w-100 rounded mb-3" style={{height:170,objectFit:'cover'}} />}
    {value && value === failedUrl && <p className="small text-warning" role="status">Photo could not load. Try another photo or link.</p>}
    <div className="d-flex flex-wrap gap-2 mb-2"><button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>fileInput.current?.click()}>{busy ? 'Reading photo…' : value ? 'Choose another photo' : 'Choose photo'}</button>{value && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={()=>change('')}>Remove photo</button>}</div>
    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} className="visually-hidden" aria-label="Upload trip photo" />
    <label className="form-label small text-muted" htmlFor={id}>Or paste a photo link</label>
    <input id={id} type="url" className="form-control" placeholder="https://example.com/photo.jpg" value={isUpload || value.startsWith('/') ? '' : value} onChange={e=>change(e.target.value.trim())} />
    <small className="text-muted d-block mt-2">JPG, PNG or WebP, up to 2 MB. {isUpload ? 'Selected photo will be saved with your trip.' : 'Leave empty to use the default cover.'}</small>
    {error && <div className="text-danger small mt-2" role="alert">{error}</div>}
  </fieldset>;
}
