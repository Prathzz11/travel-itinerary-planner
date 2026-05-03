import React, { useState, useRef, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, Globe, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import { compressImageToDataUrl } from '../utils/imageCompression';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('account');
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'INR');
  const [language, setLanguage] = useState(user?.preferences?.language || 'en');
  const [dateFormat, setDateFormat] = useState(user?.preferences?.dateFormat || 'MM/DD/YYYY');
  const [timezone, setTimezone] = useState(user?.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setCurrency(user.preferences?.currency || 'INR');
      setLanguage(user.preferences?.language || 'en');
      setDateFormat(user.preferences?.dateFormat || 'MM/DD/YYYY');
      setTimezone(user.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, [user]);

  const handleSaveProfile = (e) => { e.preventDefault(); updateUser({ name, bio, avatar }); addNotification('Profile updated successfully!', 'success'); };
  const handleSavePreferences = (e) => { e.preventDefault(); updateUser({ preferences: { ...user?.preferences, currency, language, dateFormat, timezone } }); addNotification('Preferences saved successfully!', 'success'); };
  const handlePasswordChange = (e) => { e.preventDefault(); if (newPassword !== confirmPassword) { addNotification("Passwords do not match!", 'error'); return; } setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); addNotification('Password changed successfully!', 'success'); };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      addNotification('Compressing image...', 'info');
      const base64Url = await compressImageToDataUrl(file);
      if (base64Url) { setAvatar(base64Url); addNotification('Image ready. Click Save Profile to apply.', 'success'); }
      else { addNotification('Failed to process image.', 'error'); }
    }
  };

  const tabs = [
    { id: 'account', label: 'Account Profile', icon: SettingsIcon },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="page-container animate-fade-in">
      <h1 className="display-6 fw-bold mb-4">Settings</h1>

      <div className="row g-4">
        {/* Sidebar Nav */}
        <div className="col-md-3">
          <div className="nav flex-column nav-pills">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} className={`nav-link text-start d-flex align-items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                  <Icon size={18} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="col-md-9">
          {activeTab === 'account' && (
            <div className="card animate-slide-left">
              <div className="card-body p-4">
                <h2 className="fs-4 fw-bold mb-4 pb-2 border-bottom">Public Profile</h2>
                
                <div className="d-flex align-items-center gap-4 mb-4">
                  <div className="position-relative" style={{ width: 100, height: 100 }}>
                    <img src={avatar || `https://ui-avatars.com/api/?name=${name || 'User'}`} alt="Avatar" className="rounded-circle w-100 h-100" style={{ objectFit: 'cover', border: '3px solid var(--color-border)' }} />
                    <button className="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 p-1" onClick={() => fileInputRef.current?.click()} title="Upload Picture" style={{ width: 32, height: 32 }}>
                      <Camera size={14} />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/*" />
                  </div>
                  <div>
                    <h3 className="fs-6 mb-1">Profile Picture</h3>
                    <p className="text-muted small mb-0">JPEG, PNG, or GIF (max 2MB).</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Display Name</label>
                    <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Bio / Description</label>
                    <textarea className="form-control" value={bio} onChange={e => setBio(e.target.value)} rows="3" placeholder="Tell the community about your travel style..." />
                  </div>
                  <button type="submit" className="btn btn-primary">Save Profile</button>
                </form>

                <div className="mt-4 pt-4 border-top">
                  <label className="form-label text-muted">Account Info</label>
                  <div>Email: {user?.email}</div>
                  <div className="text-muted small mt-1">Member since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="card animate-slide-left">
              <div className="card-body p-4">
                <h2 className="fs-4 fw-bold mb-4 pb-2 border-bottom">Global Preferences</h2>
                <form onSubmit={handleSavePreferences}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Default Currency</label>
                    <select className="form-select" style={{ maxWidth: 300 }} value={currency} onChange={e => setCurrency(e.target.value)}>
                      <option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option><option value="CAD">CAD ($)</option><option value="AUD">AUD ($)</option>
                      <option value="CHF">CHF (Fr)</option><option value="CNY">CNY (¥)</option><option value="KRW">KRW (₩)</option>
                      <option value="SGD">SGD (S$)</option><option value="AED">AED</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Language</label>
                    <select className="form-select" style={{ maxWidth: 300 }} value={language} onChange={e => setLanguage(e.target.value)}>
                      <option value="en">English</option><option value="es">Español</option><option value="fr">Français</option>
                      <option value="de">Deutsch</option><option value="ja">日本語</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Date Format</label>
                    <select className="form-select" style={{ maxWidth: 300 }} value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option><option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option><option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                    </select>
                    <div className="form-text">Affects how dates are displayed across the app.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Timezone</label>
                    <select className="form-select" style={{ maxWidth: 300 }} value={timezone} onChange={e => setTimezone(e.target.value)}>
                      <option value="UTC">UTC</option><option value="America/New_York">America/New York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option><option value="Europe/Paris">Europe/Paris (CET)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option><option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT)</option><option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">Save Preferences</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card animate-slide-left">
              <div className="card-body p-4">
                <h2 className="fs-4 fw-bold mb-4 pb-2 border-bottom">Change Password</h2>
                <form onSubmit={handlePasswordChange} style={{ maxWidth: 400 }}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Current Password</label>
                    <input type="password" className="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">New Password</label>
                    <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Confirm New Password</label>
                    <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary">Update Password</button>
                </form>

                <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--color-danger)' }}>
                  <h3 className="text-danger fs-5 mb-3">Danger Zone</h3>
                  <button className="btn btn-outline-danger">Delete Account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
