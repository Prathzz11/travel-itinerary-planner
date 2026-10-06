import { useTripPermissions } from '../hooks/useTripPermissions';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Plus, Shield, ShieldAlert, Eye, UserMinus, Link as LinkIcon, Check } from 'lucide-react';
import { useTrip } from '../hooks/useTrip';
import TripNav from '../components/trip/TripNav';
import { MEMBER_ROLES } from '../utils/categoryConfig';

const MembersPage = () => {
  const { id } = useParams();
  const { trips, addMember, removeMember, updateMemberRole } = useTrip();
  const trip = trips?.find(t => (t._id || t.id) === id);
  const { canManage } = useTripPermissions(trip);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  if (!trip) return <div className="page-container"><div className="card text-center py-5"><h2>Trip not found</h2></div></div>;

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
    await addMember(id, {
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(inviteEmail.split('@')[0])}&background=1e3a5f&color=38bdf8&size=96`
    });
    setIsInviteModalOpen(false); setInviteEmail('');
    } catch { /* Context displays the error; retain the input. */ }
  };

  const handleCopyLink = async () => {
    setCopyError('');
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/trip/${id}`);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch { setCopyError('Could not copy the link. Copy the trip URL from your address bar.'); }
  };

  return (
    <div className="page-container animate-fade-in">
      {copyError && <div role="alert" className="alert alert-danger">{copyError}</div>}
      <div className="card" style={{ minHeight: '80vh' }}>
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fs-3 mb-0">{trip.title} - Members</h2>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={handleCopyLink}>{copied ? <><Check size={14} color="var(--color-success)" /> Copied!</> : <><LinkIcon size={14} /> Copy Link</>}</button>
              <button disabled={!canManage} className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={() => setIsInviteModalOpen(true)}><Plus size={14} /> Add Member</button>
            </div>
          </div>
          <TripNav tripId={trip._id || trip.id} />
        </div>
        <div className="card-body">
          <div className="row g-3">
            {trip.members?.map((member, idx) => {
              // Extract memberId for API calls: try _id first, then user (which is the ObjectId ref)
              // Members should have either their own _id or a user reference that the backend can match
              const memberId = member._id || (typeof member.user === 'object' ? member.user._id : member.user);
              
              // Use the same ID for rendering key
              const renderKey = memberId || `member_${idx}`;

              const avatarUrl = member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=1e3a5f&color=38bdf8&size=96`;
              return (
                <div key={renderKey} className="col-md-6 col-lg-4">
                  <div className="card animate-fade-in">
                    <div className="card-body d-flex align-items-center justify-content-between gap-2">
                      <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
                        <div className="position-relative flex-shrink-0">
                          <img src={avatarUrl} alt={member.name} className="rounded-circle" style={{ width: 48, height: 48, objectFit: 'cover' }} />
                          <div className="position-absolute bottom-0 end-0 rounded-circle" style={{ width: 12, height: 12, background: member.online ? 'var(--color-success)' : 'var(--color-text-muted)', border: '2px solid var(--bs-body-bg)' }}></div>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="fw-semibold text-truncate">{member.name}</div>
                          <span className="badge small" style={{ background: MEMBER_ROLES[member.role]?.bgColor, color: MEMBER_ROLES[member.role]?.color }}>{MEMBER_ROLES[member.role]?.emoji} {MEMBER_ROLES[member.role]?.label || member.role}</span>
                          <div className="text-muted small text-truncate">{member.email}</div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>Joined {new Date(member.joinedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="d-flex flex-column gap-1 align-items-end flex-shrink-0">
                        <select className="form-select form-select-sm" style={{ width: 100 }} disabled={!canManage || String(member.user?._id || member.user) === String(trip.owner?._id || trip.owner)} value={member.role} onChange={e => { updateMemberRole(trip._id || trip.id, memberId, e.target.value).catch(() => {}); }}>
                          <option value="admin">Admin</option><option value="editor">Editor</option><option value="viewer">Viewer</option>
                        </select>
                        <button disabled={!canManage || String(member.user?._id || member.user) === String(trip.owner?._id || trip.owner)} className="btn btn-link btn-sm text-danger p-0 d-flex align-items-center gap-1" onClick={() => { removeMember(trip._id || trip.id, memberId).catch(() => {}); }}><UserMinus size={12} /> Remove</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <>
          <div className="modal-backdrop show" style={{ backdropFilter: 'blur(4px)' }} onClick={() => setIsInviteModalOpen(false)}></div>
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content animate-scale-in">
                <div className="modal-header"><h5 className="modal-title">Add Member</h5><button type="button" className="btn-close btn-close-white" onClick={() => setIsInviteModalOpen(false)}></button></div>
                <div className="modal-body">
                  <form id="inviteForm" onSubmit={handleInvite}>
                    <div className="mb-3"><label className="form-label text-muted">Email</label><input type="email" className="form-control" placeholder="Email address" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required /></div>
                    <div className="mb-3"><label className="form-label text-muted">Role</label><select className="form-select" value={inviteRole} onChange={e => setInviteRole(e.target.value)}><option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option></select></div>
                  </form>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-outline-secondary" onClick={() => setIsInviteModalOpen(false)}>Cancel</button><button type="submit" form="inviteForm" className="btn btn-primary">Add Member</button></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MembersPage;
