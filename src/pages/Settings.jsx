import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Globe, Camera, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import { compressImageToDataUrl } from '../utils/imageCompression';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotification();
  
  const [activeTab, setActiveTab] = useState('account');
  const fileInputRef = useRef(null);

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  // Preferences State
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'USD');
  const [language, setLanguage] = useState(user?.preferences?.language || 'en');
  const [dateFormat, setDateFormat] = useState(user?.preferences?.dateFormat || 'MM/DD/YYYY');
  const [timezone, setTimezone] = useState(user?.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setCurrency(user.preferences?.currency || 'USD');
      setLanguage(user.preferences?.language || 'en');
      setDateFormat(user.preferences?.dateFormat || 'MM/DD/YYYY');
      setTimezone(user.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, [user]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUser({ name, bio, avatar });
    addNotification('Profile updated successfully!', 'success');
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    updateUser({ preferences: { ...user?.preferences, currency, language, dateFormat, timezone } });
    addNotification('Preferences saved successfully!', 'success');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addNotification("Passwords do not match!", 'error');
      return;
    }
    // Simulate API Call
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    addNotification('Password changed successfully!', 'success');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      addNotification('Compressing image...', 'info');
      const base64Url = await compressImageToDataUrl(file);
      if (base64Url) {
        setAvatar(base64Url);
        addNotification('Image ready. Click Save Profile to apply.', 'success');
      } else {
        addNotification('Failed to process image.', 'error');
      }
    }
  };

  return (
    <div className="page-container" style={{ padding: 'var(--space-8)' }}>
      <h1 style={{ fontSize: '2.5rem', margin: '0 0 var(--space-6) 0' }}>Settings</h1>

      <div className="settings-grid">
        
        {/* Settings Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <button 
            onClick={() => setActiveTab('account')} 
            style={{ padding: 'var(--space-3)', background: activeTab === 'account' ? 'var(--color-primary)' : 'transparent', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', textAlign: 'left', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: '0.2s' }}
          >
            <SettingsIcon size={18} /> Account Profile
          </button>
          <button 
            onClick={() => setActiveTab('preferences')} 
            style={{ padding: 'var(--space-3)', background: activeTab === 'preferences' ? 'var(--color-primary)' : 'transparent', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: '0.2s' }}
          >
            <Globe size={18} /> Preferences
          </button>
          <button 
            onClick={() => setActiveTab('security')} 
            style={{ padding: 'var(--space-3)', background: activeTab === 'security' ? 'var(--color-primary)' : 'transparent', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: '0.2s' }}
          >
            <Shield size={18} /> Security
          </button>
        </div>

        {/* Settings Content */}
        <div style={{ position: 'relative' }}>
          <AnimatePresence mode="wait">
            
            {activeTab === 'account' && (
              <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-panel" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <h2 style={{ margin: '0 0 var(--space-4) 0', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>Public Profile</h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', marginBottom: 'var(--space-2)' }}>
                  <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <img src={avatar || `https://ui-avatars.com/api/?name=${name || 'User'}`} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-border)' }} />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                      title="Upload Picture"
                    >
                      <Camera size={16} />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/*" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>Profile Picture</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>JPEG, PNG, or GIF (max 2MB).</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Display Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Bio / Description</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows="3" placeholder="Tell the community about your travel style..." style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'white', resize: 'vertical' }} />
                  </div>
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <button type="submit" style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}>Save Profile</button>
                  </div>
                </form>

                <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Account Info</label>
                  <div style={{ color: 'white' }}>Email: {user?.email}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>Member since: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div key="preferences" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-panel" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <h2 style={{ margin: '0 0 var(--space-4) 0', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>Global Preferences</h2>
                
                <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Default Currency</label>
                    <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: '100%', maxWidth: '300px', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Language</label>
                    <select value={language} onChange={e => setLanguage(e.target.value)} style={{ width: '100%', maxWidth: '300px', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Date Format</label>
                    <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} style={{ width: '100%', maxWidth: '300px', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                    </select>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: '6px 0 0' }}>Affects how dates are displayed across the app.</p>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Timezone</label>
                    <select value={timezone} onChange={e => setTimezone(e.target.value)} style={{ width: '100%', maxWidth: '300px', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New York (EST)</option>
                      <option value="America/Chicago">America/Chicago (CST)</option>
                      <option value="America/Denver">America/Denver (MST)</option>
                      <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
                      <option value="America/Sao_Paulo">America/São Paulo (BRT)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Europe/Paris">Europe/Paris (CET)</option>
                      <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="Asia/Bangkok">Asia/Bangkok (ICT)</option>
                      <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      <option value="Asia/Seoul">Asia/Seoul (KST)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                      <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                      <option value="Pacific/Auckland">Pacific/Auckland (NZST)</option>
                    </select>
                  </div>
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <button type="submit" style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}>Save Preferences</button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-panel" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <h2 style={{ margin: '0 0 var(--space-4) 0', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>Change Password</h2>
                
                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '400px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Current Password</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                  </div>
                  <div style={{ marginTop: 'var(--space-2)' }}>
                    <button type="submit" style={{ background: 'var(--color-accent)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}>Update Password</button>
                  </div>
                </form>

                <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-danger)' }}>
                  <h3 style={{ color: 'var(--color-danger)', margin: '0 0 12px 0' }}>Danger Zone</h3>
                  <button style={{ background: 'transparent', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '10px 24px', borderRadius: 'var(--radius-full)', fontWeight: 600, cursor: 'pointer' }}>Delete Account</button>
                </div>
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
