import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Plus, Shield, ShieldAlert, Eye, UserMinus, Link as LinkIcon, Check } from 'lucide-react';
import { useTrip } from '../hooks/useTrip';
import TripNav from '../components/trip/TripNav';
import { MEMBER_ROLES } from '../utils/categoryConfig';

const MembersPage = () => {
  const { id } = useParams();
  const { trips, addMember, removeMember, updateMemberRole } = useTrip();
  const trip = trips?.find(t => t.id === id);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [copied, setCopied] = useState(false);

  if (!trip) return <div className="page-container glass-panel"><h2 style={{textAlign: 'center', margin: 'auto'}}>Trip not found</h2></div>;

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    const newMember = {
      id: `m${Math.random().toString().substr(2, 6)}`,
      name: inviteEmail.split('@')[0], // Mock name based on email
      email: inviteEmail,
      role: inviteRole,
      joinedAt: new Date().toISOString(),
      avatar: `https://i.pravatar.cc/150?u=${inviteEmail}`,
      online: true // Simulate they join immediately online
    };
    
    addMember(id, newMember);
    setIsInviteModalOpen(false);
    setInviteEmail('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const roleIcons = {
    admin: <ShieldAlert size={16} color="var(--color-danger)" />,
    editor: <Shield size={16} color="var(--color-primary)" />,
    viewer: <Eye size={16} color="var(--color-text-muted)" />
  };

  return (
    <div className="page-container" style={{ padding: 'var(--space-8)' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
        
        {/* Header matching others */}
        <div style={{ padding: 'var(--space-6) var(--space-6) 0', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{trip.title} - Members</h2>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <button onClick={handleCopyLink} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                {copied ? <Check size={16} color="var(--color-success)" /> : <LinkIcon size={16} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button onClick={() => setIsInviteModalOpen(true)} style={{ background: 'var(--color-primary)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                <Plus size={16} /> Invite
              </button>
            </div>
          </div>
          <TripNav tripId={trip.id} />
        </div>

        {/* Members List */}
        <div style={{ padding: 'var(--space-6)', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            <AnimatePresence>
              {trip.members?.map((member) => (
                <motion.div 
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={member.avatar} alt={member.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: member.online ? 'var(--color-success)' : 'var(--color-text-muted)', border: '2px solid var(--color-surface)', transition: 'background 0.3s' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {member.name}
                      </div>
                      {/* Role Badge */}
                      <div title={MEMBER_ROLES[member.role]?.description} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '4px', padding: '3px 9px', borderRadius: 'var(--radius-full)', background: MEMBER_ROLES[member.role]?.bgColor || 'rgba(148,163,184,0.15)', color: MEMBER_ROLES[member.role]?.color || '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span>{MEMBER_ROLES[member.role]?.emoji}</span>
                        {MEMBER_ROLES[member.role]?.label || member.role}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '3px' }}>{member.email}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Joined {new Date(member.joinedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  {/* Admin Controls Dropdown (Simulated with simple selects/buttons) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <select 
                      value={member.role}
                      onChange={(e) => updateMemberRole(trip.id, member.id, e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '4px', color: 'white', padding: '4px 8px', fontSize: '0.85rem' }}
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button 
                      onClick={() => removeMember(trip.id, member.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <UserMinus size={14} /> Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsInviteModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)' }} />
            
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="glass-panel responsive-modal" style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-6)', position: 'relative', zIndex: 1001 }}>
              <h2 style={{ margin: '0 0 var(--space-6) 0' }}>Invite Member</h2>
              
              <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="var(--color-text-muted)" style={{ position: 'absolute', top: '50%', left: 'var(--space-3)', transform: 'translateY(-50%)' }} />
                  <input type="email" placeholder="Email address" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Role</label>
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                    <option value="viewer">Viewer (Can view only)</option>
                    <option value="editor">Editor (Can modify itinerary)</option>
                    <option value="admin">Admin (Can manage members/trip)</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  <button type="button" onClick={() => setIsInviteModalOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '8px 16px', background: 'var(--color-primary)', border: 'none', borderRadius: '20px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Send Invite</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MembersPage;
