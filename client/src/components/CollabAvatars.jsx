import { getAvatarInitials } from '../utils/itineraryHelpers.js';

const COLORS = ['#dbeafe', '#d1fae5', '#fef3c7', '#ede9fe', '#fee2e2', '#f0fdf4'];
const TEXT_COLORS = ['#2563eb', '#065f46', '#92400e', '#5b21b6', '#b91c1c', '#166534'];

export default function CollabAvatars({ members = [], maxShow = 5, size = 32 }) {
  const visible = members.slice(0, maxShow);
  const overflow = members.length - maxShow;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((m, idx) => {
        const name = m.username || m.name || m.email || '';
        const initials = getAvatarInitials(name);
        const bg = COLORS[idx % COLORS.length];
        const color = TEXT_COLORS[idx % TEXT_COLORS.length];
        return (
          <div
            key={m._id || idx}
            title={name}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: bg,
              color,
              fontSize: size * 0.3,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff',
              marginLeft: idx > 0 ? -size * 0.35 : 0,
              zIndex: visible.length - idx,
              position: 'relative',
              flexShrink: 0,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
            }}
          >
            {initials}
          </div>
        );
      })}
      {overflow > 0 && (
        <div
          title={`${overflow} more members`}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: '#f1f5f9',
            color: '#64748b',
            fontSize: size * 0.28,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #fff',
            marginLeft: -size * 0.35,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
