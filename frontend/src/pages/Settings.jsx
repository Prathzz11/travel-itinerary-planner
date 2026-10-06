import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import { changePassword } from '../services/authService';
import { compressImageToDataUrl } from '../utils/imageCompression';
import { CURRENCIES } from '../utils/constants';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotification();
  const [tab, setTab] = useState('Profile');
  const [profile, setProfile] = useState({ name: user.name, bio: user.bio || '', avatar: user.avatar || '' });
  const [currency, setCurrency] = useState(user.preferences?.currency || 'INR');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setError(''); setSaving(true);
    try {
      if (tab === 'Profile') await updateUser(profile);
      if (tab === 'Preferences') await updateUser({ preferences: { ...user.preferences, currency } });
      if (tab === 'Password') {
        if (passwords.newPassword !== passwords.confirmPassword) throw new Error('Passwords do not match');
        await changePassword(passwords);
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
      addNotification(`${tab} saved`, 'success');
    } catch (err) { setError(err.userMessage || err.message); }
    finally { setSaving(false); }
  }
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const avatar = await compressImageToDataUrl(file);
      if (!avatar) throw new Error('Could not process image');
      setProfile(prev => ({ ...prev, avatar }));
    } catch (err) { setError(err.message); }
  }
  return <div className="page-container">
    <h1>Settings</h1>
    <div className="nav nav-tabs mb-4">{['Profile', 'Preferences', 'Password'].map(name => <button key={name} disabled={saving} className={`nav-link ${tab === name ? 'active' : ''}`} onClick={() => { setTab(name); setError(''); }}>{name}</button>)}</div>
    <form className="card card-body" onSubmit={save} style={{ maxWidth: 640 }}>
      {error && <div role="alert" className="alert alert-danger">{error}</div>}
      {tab === 'Profile' && <>
        <img src={profile.avatar || undefined} alt="Profile" width="80" height="80" className="rounded-circle mb-3" />
        <label className="form-label">Profile picture<input className="form-control" type="file" accept="image/*" onChange={upload} /></label>
        <label className="form-label">Display name<input className="form-control" value={profile.name} maxLength={100} required onChange={e => setProfile({ ...profile, name: e.target.value })} /></label>
        <label className="form-label">Bio<textarea className="form-control" value={profile.bio} maxLength={500} onChange={e => setProfile({ ...profile, bio: e.target.value })} /></label>
        <p className="text-muted">{user.email}</p>
      </>}
      {tab === 'Preferences' && <label className="form-label">Default currency for new trips<select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>{CURRENCIES.map(value => <option key={value}>{value}</option>)}</select></label>}
      {tab === 'Password' && Object.entries({ currentPassword: 'Current password', newPassword: 'New password', confirmPassword: 'Confirm new password' }).map(([key, label]) => <label className="form-label" key={key}>{label}<input type="password" className="form-control" autoComplete={key === 'currentPassword' ? 'current-password' : 'new-password'} required minLength={key === 'currentPassword' ? 1 : 6} value={passwords[key]} onChange={e => setPasswords({ ...passwords, [key]: e.target.value })} /></label>)}
      <button disabled={saving} className="btn btn-primary align-self-start" type="submit">{saving ? 'Saving...' : `Save ${tab}`}</button>
    </form>
  </div>;
}
